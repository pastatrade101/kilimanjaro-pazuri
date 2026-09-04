import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getRoom, listAvailableRooms, createEnquiry, listRoomImages } from '$lib/server/repo';
import { validateEnquiry, type Issues } from '$lib/server/validate';
import { limitEnquiries } from '$lib/server/ratelimit';

export const load: PageServerLoad = async ({ params }) => {
	const room = await getRoom(params.slug);
	if (!room) error(404, 'We could not find that room.');

	const others = (await listAvailableRooms())
		.filter((r) => r.slug !== room.slug)
		.slice(0, 3);
	return { room, others, images: await listRoomImages(params.slug) };
};

export const actions: Actions = {
	default: async ({ request, params, getClientAddress }) => {
		const limit = limitEnquiries(getClientAddress());
		if (!limit.allowed) {
			const issues: Issues = { form: 'Too many enquiries from this connection. Please try again shortly.' };
			return fail(429, { issues, values: {} as Record<string, string> });
		}

		// The slug reaches here from the URL; a room that has since been removed
		// must not silently collect enquiries.
		if (!(await getRoom(params.slug))) {
			const issues: Issues = { form: 'That room is no longer available.' };
			return fail(404, { issues, values: {} as Record<string, string> });
		}

		const data = await request.formData();
		data.set('room', params.slug);

		const result = validateEnquiry(data, 'booking');
		if (!result.ok) return fail(400, { issues: result.issues, values: result.values });

		await createEnquiry(result.value);
		return { success: true };
	}
};
