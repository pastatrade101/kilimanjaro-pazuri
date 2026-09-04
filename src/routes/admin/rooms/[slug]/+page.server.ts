import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getRoom,
	updateRoom,
	listRoomImages,
	addRoomImage,
	deleteRoomImage,
	setFeaturedRoomImage,
	updateRoomImageAlt,
	moveRoomImage
} from '$lib/server/repo';
import { storeUpload, MediaError, ROOM_MAX_BYTES } from '$lib/server/media';

export const load: PageServerLoad = async ({ params }) => {
	const room = await getRoom(params.slug);
	if (!room) error(404, 'No such room.');
	return { room, images: await listRoomImages(params.slug), maxBytes: ROOM_MAX_BYTES };
};

export const actions: Actions = {
	details: async ({ request, params }) => {
		const room = await getRoom(params.slug);
		if (!room) return fail(404, { error: 'That room is no longer there.' });

		const data = await request.formData();

		// Checklist item 14 is the exact spelling of the Seluhi room name, so
		// this field exists to be corrected — but never emptied.
		const name = String(data.get('name') ?? '').trim();
		if (name.length < 2 || name.length > 80) {
			return fail(400, { error: 'A room name needs between 2 and 80 characters.' });
		}

		const summary = String(data.get('summary') ?? '').trim();
		if (summary.length < 5) return fail(400, { error: 'Write a sentence describing the room.' });

		const rate = Number(data.get('rate_usd'));
		if (!Number.isInteger(rate) || rate < 0 || rate > 100000) {
			return fail(400, { error: 'Please enter a whole rate in US dollars.' });
		}

		await updateRoom(params.slug, {
			name,
			summary,
			image: room.image,
			rate_usd: rate,
			guests: String(data.get('guests') ?? '').trim() || 'To be confirmed',
			bed: String(data.get('bed') ?? '').trim() || 'To be confirmed',
			bathroom: String(data.get('bathroom') ?? '').trim() || 'Private',
			is_available: Boolean(data.get('is_available'))
		});

		redirect(303, '/admin/rooms');
	},

	/** Adds one or more photographs. Several can be chosen at once. */
	addImages: async ({ request, params }) => {
		if (!(await getRoom(params.slug))) return fail(404, { error: 'That room is no longer there.' });

		const data = await request.formData();
		const files = data.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
		const alt = String(data.get('alt') ?? '').trim();
		const src = String(data.get('src') ?? '').trim();

		if (files.length === 0 && !src) {
			return fail(400, { error: 'Choose one or more photographs to add.' });
		}

		let added = 0;
		for (const file of files) {
			try {
				const stored = await storeUpload(file, ROOM_MAX_BYTES);
				await addRoomImage(params.slug, stored, alt || file.name.replace(/\.[^.]+$/, ''));
				added += 1;
			} catch (uploadError) {
				const message =
					uploadError instanceof MediaError ? uploadError.message : 'That upload failed.';
				// Whatever already went in is kept; the owner is told what did not.
				return fail(400, {
					error: added > 0 ? `${added} added. ${file.name}: ${message}` : `${file.name}: ${message}`
				});
			}
		}

		if (src) {
			await addRoomImage(params.slug, src, alt);
			added += 1;
		}

		return { addedImages: added };
	},

	featureImage: async ({ request }) => {
		const id = Number((await request.formData()).get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'That photograph is no longer there.' });
		await setFeaturedRoomImage(id);
		return { featured: true };
	},

	describeImage: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'That photograph is no longer there.' });
		await updateRoomImageAlt(id, String(data.get('alt') ?? '').trim());
		return { describedImage: true };
	},

	removeImage: async ({ request, params }) => {
		const id = Number((await request.formData()).get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'That photograph is no longer there.' });

		const images = await listRoomImages(params.slug);
		if (images.length === 1) {
			return fail(400, { error: 'A room needs at least one photograph.' });
		}

		await deleteRoomImage(id);
		return { removedImage: true };
	},

	moveImage: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'That photograph is no longer there.' });
		await moveRoomImage(id, data.get('direction') === 'up' ? 'up' : 'down');
		return { movedImage: true };
	}
};
