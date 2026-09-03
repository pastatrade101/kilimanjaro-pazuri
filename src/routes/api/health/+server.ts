import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRooms } from '$lib/server/repo';

export const GET: RequestHandler = async () => {
	return json({ status: 'ok', rooms: (await listRooms()).length });
};
