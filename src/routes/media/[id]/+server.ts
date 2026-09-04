import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readMedia } from '$lib/server/media';

/**
 * Serves an uploaded photograph. The id carries a content hash of sorts — it
 * is random and never reused — so the response can be cached indefinitely.
 */
export const GET: RequestHandler = async ({ params }) => {
	const media = await readMedia(params.id);
	if (!media) error(404, 'No such image.');

	return new Response(new Uint8Array(media.bytes), {
		headers: {
			'content-type': media.content_type,
			'cache-control': 'public, max-age=31536000, immutable',
			'content-length': String(media.bytes.length)
		}
	});
};
