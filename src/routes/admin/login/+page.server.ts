import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { checkCredentials, createSession } from '$lib/server/auth';
import { rateLimit } from '$lib/server/ratelimit';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.admin) redirect(303, '/admin');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress, url }) => {
		const limit = rateLimit(`login:${getClientAddress()}`, 8, 15 * 60 * 1000);
		if (!limit.allowed) {
			return fail(429, { error: 'Too many attempts. Please wait a few minutes.' });
		}

		const data = await request.formData();
		const username = String(data.get('username') ?? '');
		const password = String(data.get('password') ?? '');

		if (!checkCredentials(username, password)) {
			return fail(401, { error: 'Those details did not match.' });
		}

		createSession(username, cookies);

		const next = url.searchParams.get('next');
		redirect(303, next && next.startsWith('/admin') ? next : '/admin');
	}
};
