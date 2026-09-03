import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createEnquiry, getRoom } from '$lib/server/repo';
import { validateEnquiry } from '$lib/server/validate';
import { limitEnquiries } from '$lib/server/ratelimit';

/** Booking enquiries from any client — the site's own form posts via a form action. */
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const limit = limitEnquiries(getClientAddress());
	if (!limit.allowed) {
		return json({ error: 'Too many requests.' }, { status: 429 });
	}

	const contentType = request.headers.get('content-type') ?? '';
	const data = new FormData();

	if (contentType.includes('application/json')) {
		const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
		if (!body) return json({ error: 'Expected a JSON body.' }, { status: 400 });
		for (const [key, value] of Object.entries(body)) {
			if (value !== null && value !== undefined) data.set(key, String(value));
		}
	} else {
		try {
			for (const [key, value] of await request.formData()) data.set(key, value);
		} catch {
			return json({ error: 'That request body could not be read.' }, { status: 400 });
		}
	}

	const roomSlug = data.get('room');
	if (typeof roomSlug === 'string' && roomSlug && !getRoom(roomSlug)) {
		return json({ error: 'Unknown room.', field: 'room' }, { status: 400 });
	}

	const result = validateEnquiry(data, 'booking');
	if (!result.ok) return json({ error: 'Validation failed.', issues: result.issues }, { status: 400 });

	const id = createEnquiry(result.value);
	return json({ id, status: 'received' }, { status: 201 });
};
