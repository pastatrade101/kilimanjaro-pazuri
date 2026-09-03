import type { PageServerLoad } from './$types';
import { listAvailableRooms } from '$lib/server/repo';

export const load: PageServerLoad = async () => {
	return { rooms: await listAvailableRooms() };
};
