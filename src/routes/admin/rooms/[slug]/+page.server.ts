import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getRoom, updateRoom } from '$lib/server/repo';
import { storeUpload, MediaError } from '$lib/server/media';

export const load: PageServerLoad = async ({ params }) => {
	const room = await getRoom(params.slug);
	if (!room) error(404, 'No such room.');
	return { room };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
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

		let image = String(data.get('image') ?? '').trim() || room.image;
		const file = data.get('file');
		if (file instanceof File && file.size > 0) {
			try {
				image = await storeUpload(file);
			} catch (uploadError) {
				return fail(400, {
					error: uploadError instanceof MediaError ? uploadError.message : 'That upload failed.'
				});
			}
		}

		await updateRoom(params.slug, {
			name,
			summary,
			image,
			rate_usd: rate,
			guests: String(data.get('guests') ?? '').trim() || 'To be confirmed',
			bed: String(data.get('bed') ?? '').trim() || 'To be confirmed',
			bathroom: String(data.get('bathroom') ?? '').trim() || 'Private',
			is_available: Boolean(data.get('is_available'))
		});

		redirect(303, '/admin/rooms');
	}
};
