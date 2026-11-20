import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRoom } from '$lib/server/repo';
import { isFree, nights, takenSpans, today } from '$lib/server/bookings';

/**
 * Answers "is this room free for these nights, and what would it cost".
 *
 * Advisory only: the booking itself is settled by the exclusion constraint on
 * the table, so a yes here is never relied upon as a reservation.
 */
export const GET: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get('room') ?? '';
	const checkIn = url.searchParams.get('check_in') ?? '';
	const checkOut = url.searchParams.get('check_out') ?? '';

	const room = await getRoom(slug);
	if (!room) return json({ error: 'Unknown room.' }, { status: 404 });

	// Without dates, hand back the spans so a calendar can grey them out.
	if (!checkIn || !checkOut) {
		const from = today();
		const until = new Date(Date.parse(from + 'T00:00:00Z') + 400 * 86_400_000)
			.toISOString()
			.slice(0, 10);
		return json({ room: slug, rateUsd: room.rate_usd, taken: await takenSpans(slug, from, until) });
	}

	const ISO = /^\d{4}-\d{2}-\d{2}$/;
	if (!ISO.test(checkIn) || !ISO.test(checkOut)) {
		return json({ error: 'Dates must be YYYY-MM-DD.' }, { status: 400 });
	}

	const stay = nights(checkIn, checkOut);
	if (stay < 1) return json({ error: 'Departure must come after arrival.' }, { status: 400 });
	if (checkIn < today()) return json({ error: 'That arrival date has passed.' }, { status: 400 });

	const free = await isFree(slug, checkIn, checkOut);

	return json({
		room: slug,
		checkIn,
		checkOut,
		nights: stay,
		available: free,
		rateUsd: room.rate_usd,
		totalUsd: room.rate_usd * stay,
		currency: 'USD'
	});
};
