import { redirect, type Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { readSession, pruneSessions } from '$lib/server/auth';

// Fire and forget at boot; a failure here must not stop the server starting.
void pruneSessions().catch(() => {});

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.admin = await readSession(event.cookies);

	/*
	 * The guard lives here, not in a layout load: SvelteKit runs form actions
	 * BEFORE the load functions of the page they belong to, so a guard in
	 * +layout.server.ts would let every admin POST through unauthenticated.
	 */
	const { pathname } = event.url;
	if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !event.locals.admin) {
		if (event.request.method !== 'GET') {
			return new Response('Not authenticated.', { status: 401 });
		}
		redirect(303, `/admin/login?next=${encodeURIComponent(pathname)}`);
	}

	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

	if (!dev) {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains'
		);
	}

	// Google Fonts and the embedded map are the only third parties.
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline'",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"font-src 'self' https://fonts.gstatic.com data:",
			"img-src 'self' data:",
			"frame-src https://www.google.com https://maps.google.com",
			"connect-src 'self'",
			"form-action 'self'",
			"base-uri 'self'",
			"object-src 'none'",
			"frame-ancestors 'self'"
		].join('; ')
	);

	return response;
};
