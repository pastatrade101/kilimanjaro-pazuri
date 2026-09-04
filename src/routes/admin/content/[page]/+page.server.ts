import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { editableFields, saveContent, getContent } from '$lib/server/content';
import { labelFor, flatten } from '$lib/content/paths';
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
	const fields = editableFields().filter((field) => field.key.startsWith(`${params.page}.`));
	if (fields.length === 0) error(404, 'No such page.');

	// Show what the site is actually showing, not the deck's original.
	const live = new Map(flatten(await getContent()).map((f) => [f.key, f.value]));

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

	return {
		page: params.page,
		sections: [...sections].map(([title, items]) => ({ title, items }))
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const data = await request.formData();
		const allowed = new Set(
			editableFields()
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
	}
};
