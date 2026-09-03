import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createEnquiry, listAvailableRooms } from '$lib/server/repo';
import { validateEnquiry, type Issues } from '$lib/server/validate';
import { limitEnquiries } from '$lib/server/ratelimit';

export const load: PageServerLoad = async () => {
	return { rooms: listAvailableRooms() };
};

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		const limit = limitEnquiries(getClientAddress());
		if (!limit.allowed) {
			const issues: Issues = { form: 'Too many messages from this connection. Please try again shortly.' };
			return fail(429, { issues, values: {} as Record<string, string> });
		}

		const data = await request.formData();
		const result = validateEnquiry(data, 'contact');
		if (!result.ok) return fail(400, { issues: result.issues, values: result.values });

		createEnquiry(result.value);
		return { success: true };
	}
};
