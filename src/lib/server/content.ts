import { dbReady } from './db';
import {
	flatten,
	applyOverrides,
	listPaths,
	readPath,
	writePath,
	type Field,
	type ListShape
} from '$lib/content/paths';
import * as deck from '$lib/content/site';

/**
 * The deck's copy, exactly as written. Everything editable is derived from
 * this, so the two can never fall out of step.
 */
function defaults() {
	return {
		site: deck.site,
		nav: deck.nav,
		home: deck.home,
		rooms: deck.rooms,
		about: deck.about,
		amenities: deck.amenities,
		location: deck.location,
		gallery: deck.gallery,
		booking: deck.booking,
		contact: deck.contact,
		footer: deck.footer,
		seo: deck.seo,
		images: deck.images,
		actions: deck.actions
	};
}

export type Content = ReturnType<typeof defaults>;

/** Every field the admin screen can edit, in the order the copy declares them. */
export function editableFields(): Field[] {
	return flatten(defaults()).filter((field) => !field.key.startsWith('nav.'));
}

/** The same, but reflecting lists the owner has already grown or shrunk. */
export async function editableFieldsLive(): Promise<Field[]> {
	return flatten(await getContent()).filter((field) => !field.key.startsWith('nav.'));
}

/** Every list on a page, as it currently stands. */
export async function editableLists(page: string): Promise<ListShape[]> {
	const content = await getContent();
	return listPaths(content).filter(
		(list) => list.path === page || list.path.startsWith(`${page}.`)
	);
}

let cache: { at: number; value: Content } | null = null;
const TTL_MS = 30_000;

/** Called after any admin write, so an edit is visible at once. */
export function invalidateContent() {
	cache = null;
}

export async function getContent(): Promise<Content> {
	if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

	const sql = await dbReady();
	const [rows, lists] = await Promise.all([
		sql<{ key: string; value: string }[]>`SELECT key, value FROM content_blocks`,
		sql<{ path: string; items: unknown }[]>`SELECT path, items FROM content_lists`
	]);

	// Lists are replaced first: a field override addresses an item by index, so
	// it must be applied to the list the owner actually has.
	const base = structuredClone(defaults());
	for (const list of lists) {
		if (readPath(base, list.path) !== undefined) writePath(base, list.path, list.items);
	}

	const value = applyOverrides(base, new Map(rows.map((r) => [r.key, r.value])));

	// The links are built from whatever the numbers now say, rather than being
	// stored and left to rot when the telephone number changes.
	value.actions = {
		whatsapp: {
			label: value.actions.whatsapp.label,
			href:
				`https://wa.me/${value.site.whatsapp}?text=` +
				encodeURIComponent(`Hello ${value.site.name}, I would like to enquire about a room.`)
		},
		call: { label: value.actions.call.label, href: `tel:${value.site.phoneHref}` },
		rooms: { label: value.actions.rooms.label, href: '/rooms' }
	};

	cache = { at: Date.now(), value };
	return value;
}

/**
 * Saves changed fields.
 *
 * A field inside a repeatable list is written into that list, not layered on
 * top of it as a separate override — otherwise reordering or removing an item
 * would silently drop the wording, because the two would disagree about what
 * item 6 is. Everything else is a plain override, and a field edited back to
 * the deck's own words stops being one.
 */
export async function saveContent(changes: Map<string, string>) {
	const sql = await dbReady();
	const live = await getContent();
	const liveValues = new Map(flatten(live).map((f) => [f.key, f.value]));
	const deckValues = new Map(editableFields().map((f) => [f.key, f.value]));

	// Longest paths first, so 'amenities.groups.0.items' wins over
	// 'amenities.groups' when deciding which list a field belongs to.
	const lists = listPaths(live).sort((a, b) => b.path.length - a.path.length);

	const touchedLists = new Map<string, unknown[]>();
	const upserts: { key: string; value: string }[] = [];
	const resets: string[] = [];

	for (const [key, value] of changes) {
		if (!liveValues.has(key)) continue;
		if (liveValues.get(key) === value) continue;

		const list = lists.find((candidate) => key.startsWith(`${candidate.path}.`));

		if (list) {
			const items =
				touchedLists.get(list.path) ?? (structuredClone(readPath(live, list.path)) as unknown[]);
			// 'home.why.6.title' -> index 6, field 'title'
			const rest = key.slice(list.path.length + 1).split('.');
			const index = Number(rest[0]);
			if (!Number.isInteger(index) || index < 0 || index >= items.length) continue;

			if (rest.length === 1) items[index] = value;
			else if (items[index] && typeof items[index] === 'object') {
				(items[index] as Record<string, unknown>)[rest.slice(1).join('.')] = value;
			}
			touchedLists.set(list.path, items);
			continue;
		}

		if (deckValues.get(key) === value) resets.push(key);
		else upserts.push({ key, value });
	}

	for (const [path, items] of touchedLists) await saveList(path, items);

	if (upserts.length > 0) {
		await sql`
			INSERT INTO content_blocks ${sql(upserts, 'key', 'value')}
			ON CONFLICT (key) DO UPDATE
			   SET value = EXCLUDED.value, updated_at = now()
		`;
	}

	if (resets.length > 0) {
		await sql`DELETE FROM content_blocks WHERE key IN ${sql(resets)}`;
	}

	invalidateContent();
	return {
		saved: upserts.length + [...touchedLists.values()].length,
		reverted: resets.length
	};
}

/** How many fields currently differ from the deck. */
export async function overrideCount(): Promise<number> {
	const sql = await dbReady();
	const [row] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM content_blocks`;
	return Number(row.n);
}

/** Replaces a list wholesale, or restores the deck's own when it matches. */
export async function saveList(path: string, items: unknown[]) {
	const sql = await dbReady();
	const original = readPath(defaults(), path);

	if (JSON.stringify(original) === JSON.stringify(items)) {
		await sql`DELETE FROM content_lists WHERE path = ${path}`;
	} else {
		await sql`
			INSERT INTO content_lists (path, items)
			VALUES (${path}, ${sql.json(items as never)})
			ON CONFLICT (path) DO UPDATE SET items = EXCLUDED.items, updated_at = now()
		`;
	}

	// Field overrides address items by index, so they no longer mean what they
	// did once the list is reordered or shortened.
	await sql`DELETE FROM content_blocks WHERE key LIKE ${path + '.%'}`;

	invalidateContent();
}

/** The list as it currently stands, ready to be added to or trimmed. */
export async function currentList(path: string): Promise<unknown[]> {
	const value = readPath(await getContent(), path);
	return Array.isArray(value) ? structuredClone(value) : [];
}
