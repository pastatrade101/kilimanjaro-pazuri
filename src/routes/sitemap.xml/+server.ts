import type { RequestHandler } from './$types';
import { listAvailableRooms } from '$lib/server/repo';
import { nav } from '$lib/content/site';

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;
	const paths = [
		...nav.map((item) => item.href),
		...(await listAvailableRooms()).map((room) => `/rooms/${room.slug}`)
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
	.map(
		(path) =>
			`\t<url><loc>${origin}${path}</loc><changefreq>monthly</changefreq><priority>${
				path === '/' ? '1.0' : '0.7'
			}</priority></url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml', 'cache-control': 'max-age=3600' }
	});
};
