import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listAvailableRooms } from '$lib/server/repo';
import { rooms as copy } from '$lib/content/site';

export const GET: RequestHandler = async () => {
	const rooms = listAvailableRooms().map((room) => ({
		slug: room.slug,
		name: room.name,
		summary: room.summary,
		rateUsd: room.rate_usd,
		currency: 'USD',
		per: 'room per night',
		includes: copy.included,
		guests: room.guests,
		bed: room.bed,
		bathroom: room.bathroom,
		image: room.image,
		url: `/rooms/${room.slug}`
	}));

	return json({ rooms });
};
