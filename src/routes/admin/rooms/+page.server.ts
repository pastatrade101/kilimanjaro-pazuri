import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listRooms, getRoom, createRoom, deleteRoom } from '$lib/server/repo';
import { storeUpload, MediaError } from '$lib/server/media';

export const load: PageServerLoad = async () => {
	return { rooms: await listRooms() };
};

const SLUG = /^[a-z0-9-]+$/;

export const actions: Actions = {
	add: async ({ request }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		const slug = String(data.get('slug') ?? '').trim().toLowerCase();
		const summary = String(data.get('summary') ?? '').trim();
		const rate = Number(data.get('rate_usd'));
		const file = data.get('file');
		let image = String(data.get('image') ?? '').trim();

		if (name.length < 2) return fail(400, { error: 'Give the room a name.' });
		if (!SLUG.test(slug)) {
			return fail(400, { error: 'The web address may use lowercase letters, numbers and hyphens only.' });
		}
		if (await getRoom(slug)) return fail(400, { error: `There is already a room at /rooms/${slug}.` });
		if (summary.length < 5) return fail(400, { error: 'Write a sentence describing the room.' });
		if (!Number.isInteger(rate) || rate < 0 || rate > 100000) {
			return fail(400, { error: 'Please enter a whole rate in US dollars.' });
		}

		if (file instanceof File && file.size > 0) {
			try {
				image = await storeUpload(file);
			} catch (uploadError) {
				return fail(400, {
					error: uploadError instanceof MediaError ? uploadError.message : 'That upload failed.'
				});
			}
		}
		if (!image) return fail(400, { error: 'Choose a photograph for the room.' });

		await createRoom({ slug, name, summary, rate_usd: rate, image });
		return { added: name };
	},

	remove: async ({ request }) => {
		const data = await request.formData();
		const slug = String(data.get('slug') ?? '');
		const room = await getRoom(slug);
		if (!room) return fail(404, { error: 'That room is no longer there.' });

		await deleteRoom(slug);
		return { removed: room.name };
	}
};
