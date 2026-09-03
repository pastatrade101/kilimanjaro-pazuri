import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listRooms, getRoom, updateRoom } from '$lib/server/repo';

export const load: PageServerLoad = async () => {
	return { rooms: listRooms() };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const slug = String(data.get('slug') ?? '');

		if (!getRoom(slug)) return fail(404, { error: 'That room no longer exists.' });

		const rate = Number(data.get('rate_usd'));
		if (!Number.isInteger(rate) || rate < 0 || rate > 100000) {
			return fail(400, { error: 'Please enter a whole rate in US dollars.', slug });
		}

		updateRoom(slug, {
			rate_usd: rate,
			guests: String(data.get('guests') ?? '').trim() || 'To be confirmed',
			bed: String(data.get('bed') ?? '').trim() || 'To be confirmed',
			bathroom: String(data.get('bathroom') ?? '').trim() || 'Private',
			is_available: data.get('is_available') ? 1 : 0
		});

		return { saved: slug };
	}
};
