import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	listGallery,
	createGalleryImage,
	updateGalleryImage,
	deleteGalleryImage,
	moveGalleryImage
} from '$lib/server/repo';
import { storeUpload, MediaError } from '$lib/server/media';

export const load: PageServerLoad = async () => {
	const images = await listGallery();
	const groupings = [...new Set(images.map((image) => image.grouping))];
	return { images, groupings };
};

export const actions: Actions = {
	/** Adds a photograph, either uploaded or by path. */
	add: async ({ request }) => {
		const data = await request.formData();
		const alt = String(data.get('alt') ?? '').trim();
		const grouping = String(data.get('grouping') ?? '').trim();
		const file = data.get('file');
		let src = String(data.get('src') ?? '').trim();

		if (alt.length < 2) return fail(400, { error: 'Describe the photograph, for readers who cannot see it.' });
		if (grouping.length < 2) return fail(400, { error: 'Give the photograph a collection.' });

		if (file instanceof File && file.size > 0) {
			try {
				src = await storeUpload(file);
			} catch (uploadError) {
				return fail(400, {
					error: uploadError instanceof MediaError ? uploadError.message : 'That upload failed.'
				});
			}
		}

		if (!src) return fail(400, { error: 'Choose a photograph to add.' });

		await createGalleryImage({ src, alt, grouping });
		return { added: true };
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const alt = String(data.get('alt') ?? '').trim();
		const grouping = String(data.get('grouping') ?? '').trim();

		if (!Number.isInteger(id)) return fail(400, { error: 'That photograph is no longer there.' });
		if (alt.length < 2 || grouping.length < 2) {
			return fail(400, { error: 'A photograph needs a description and a collection.' });
		}

		await updateGalleryImage(id, { alt, grouping });
		return { updated: true };
	},

	remove: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'That photograph is no longer there.' });
		await deleteGalleryImage(id);
		return { removed: true };
	},

	move: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const direction = data.get('direction') === 'up' ? 'up' : 'down';
		if (!Number.isInteger(id)) return fail(400, { error: 'That photograph is no longer there.' });
		await moveGalleryImage(id, direction);
		return { moved: true };
	}
};
