import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	editableFields,
	editableFieldsLive,
	saveContent,
	getContent,
	editableLists,
	saveList,
	currentList
} from '$lib/server/content';
import { labelFor, flatten, readPath } from '$lib/content/paths';
import { storeUpload, MediaError } from '$lib/server/media';

/** Groups a page's fields the way the copy itself is organised. */
function sectionFor(key: string): string {
	const parts = key.split('.');
	if (parts.length > 2) return humanise(parts[1]);

	// `heroTitle` and `heroText` belong together; `title` alone does not.
	const leading = parts[1].match(/^[a-z]+/)?.[0] ?? '';
	const rest = parts[1].slice(leading.length);
	return rest.length > 0 ? humanise(leading) : 'Main copy';
}

function humanise(word: string): string {
	const spaced = word.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export const load: PageServerLoad = async ({ params }) => {
	const fields = (await editableFieldsLive()).filter((field) =>
		field.key.startsWith(`${params.page}.`)
	);
	if (fields.length === 0) error(404, 'No such page.');

	// Show what the site is actually showing, not the deck's original.
	const content = await getContent();
	const live = new Map(flatten(content).map((f) => [f.key, f.value]));

	const sections = new Map<string, { key: string; label: string; kind: string; value: string }[]>();
	for (const field of fields) {
		const section = sectionFor(field.key);
		const bucket = sections.get(section) ?? [];
		bucket.push({
			key: field.key,
			label: labelFor(field.key),
			kind: field.kind,
			value: live.get(field.key) ?? field.value
		});
		sections.set(section, bucket);
	}

	// The repeatable parts of this page, which can be grown or trimmed.
	const shapes = await editableLists(params.page);
	const lists = shapes.map((shape) => {
		const items = (readPath(content, shape.path) ?? []) as unknown[];
		return {
			path: shape.path,
			label: shape.label,
			fields: shape.fields,
			rows: items.map((item, index) =>
				shape.fields
					? {
							index,
							values: Object.fromEntries(
								shape.fields.map((f) => [f, String((item as Record<string, unknown>)[f] ?? '')])
							)
						}
					: { index, values: { value: String(item) } }
			)
		};
	});

	return {
		page: params.page,
		sections: [...sections].map(([title, items]) => ({ title, items })),
		lists
	};
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const data = await request.formData();
		const allowed = new Set(
			(await editableFieldsLive())
				.filter((field) => field.key.startsWith(`${params.page}.`))
				.map((field) => field.key)
		);

		const changes = new Map<string, string>();

		// A chosen photograph replaces whatever path the text field holds.
		for (const [name, value] of data) {
			if (!(value instanceof File) || !name.startsWith('upload:')) continue;
			const key = name.slice('upload:'.length);
			if (!allowed.has(key) || value.size === 0) continue;
			try {
				changes.set(key, await storeUpload(value));
			} catch (uploadError) {
				const message =
					uploadError instanceof MediaError
						? uploadError.message
						: 'That photograph could not be saved.';
				return fail(400, { error: `${labelFor(key)}: ${message}` });
			}
		}

		for (const [name, value] of data) {
			if (typeof value !== 'string' || !allowed.has(name)) continue;
			if (changes.has(name)) continue;
			const trimmed = value.trim();
			if (trimmed.length === 0) {
				return fail(400, { error: `${labelFor(name)} cannot be empty.` });
			}
			if (trimmed.length > 4000) {
				return fail(400, { error: `${labelFor(name)} is too long.` });
			}
			changes.set(name, trimmed);
		}

		const result = await saveContent(changes);
		return { saved: result.saved, reverted: result.reverted };
	},

	/** Appends an empty item, ready to be filled in. */
	add: async ({ request, params }) => {
		const data = await request.formData();
		const path = String(data.get('path') ?? '');
		if (!(await allowedList(params.page, path))) return fail(400, { error: 'Unknown list.' });

		const items = await currentList(path);
		const template = items[0];

		const blank =
			template && typeof template === 'object' && !Array.isArray(template)
				? Object.fromEntries(
						Object.entries(template as Record<string, unknown>).map(([k, v]) => [
							k,
							typeof v === 'string' ? '' : v
						])
					)
				: '';

		items.push(blank);
		await saveList(path, items);
		return { added: path };
	},

	remove: async ({ request, params }) => {
		const data = await request.formData();
		const path = String(data.get('path') ?? '');
		const index = Number(data.get('index'));
		if (!(await allowedList(params.page, path))) return fail(400, { error: 'Unknown list.' });

		const items = await currentList(path);
		if (!Number.isInteger(index) || index < 0 || index >= items.length) {
			return fail(400, { error: 'That item is no longer there.' });
		}
		if (items.length === 1) {
			return fail(400, { error: 'A list needs at least one item. Edit this one instead.' });
		}

		items.splice(index, 1);
		await saveList(path, items);
		return { removed: path };
	},

	move: async ({ request, params }) => {
		const data = await request.formData();
		const path = String(data.get('path') ?? '');
		const index = Number(data.get('index'));
		const delta = data.get('direction') === 'up' ? -1 : 1;
		if (!(await allowedList(params.page, path))) return fail(400, { error: 'Unknown list.' });

		const items = await currentList(path);
		const target = index + delta;
		if (target < 0 || target >= items.length) return { moved: path };

		[items[index], items[target]] = [items[target], items[index]];
		await saveList(path, items);
		return { moved: path };
	}
};

/** Only lists belonging to the page being edited may be changed from it. */
async function allowedList(page: string, path: string): Promise<boolean> {
	const shapes = await editableLists(page);
	return shapes.some((shape) => shape.path === path);
}
