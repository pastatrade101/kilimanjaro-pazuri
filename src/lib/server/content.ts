import { dbReady } from './db';
import { flatten, applyOverrides, type Field } from '$lib/content/paths';
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

let cache: { at: number; value: Content } | null = null;
const TTL_MS = 30_000;

/** Called after any admin write, so an edit is visible at once. */
export function invalidateContent() {
	cache = null;
}

export async function getContent(): Promise<Content> {
	if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

	const sql = await dbReady();
	const rows = await sql<{ key: string; value: string }[]>`
		SELECT key, value FROM content_blocks
	`;

	const value = applyOverrides(defaults(), new Map(rows.map((r) => [r.key, r.value])));

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

/** Saves the fields that differ from the deck, and clears the ones that match. */
export async function saveContent(changes: Map<string, string>) {
	const sql = await dbReady();
	const original = new Map(editableFields().map((field) => [field.key, field.value]));

	const upserts: { key: string; value: string }[] = [];
	const resets: string[] = [];

	for (const [key, value] of changes) {
		if (!original.has(key)) continue;
		if (original.get(key) === value) resets.push(key);
		else upserts.push({ key, value });
	}

	if (upserts.length > 0) {
		await sql`
			INSERT INTO content_blocks ${sql(upserts, 'key', 'value')}
			ON CONFLICT (key) DO UPDATE
			   SET value = EXCLUDED.value, updated_at = now()
		`;
	}

	// A field edited back to the deck's own words stops being an override.
	if (resets.length > 0) {
		await sql`DELETE FROM content_blocks WHERE key IN ${sql(resets)}`;
	}

	invalidateContent();
	return { saved: upserts.length, reverted: resets.length };
}

/** How many fields currently differ from the deck. */
export async function overrideCount(): Promise<number> {
	const sql = await dbReady();
	const [row] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM content_blocks`;
	return Number(row.n);
}
