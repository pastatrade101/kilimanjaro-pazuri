import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.admin && url.pathname !== '/admin/login') {
		redirect(303, `/admin/login?next=${encodeURIComponent(url.pathname)}`);
	}
	return { admin: locals.admin };
};
