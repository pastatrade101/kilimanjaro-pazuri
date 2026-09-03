import type { PageServerLoad } from './$types';
import { listRooms } from '$lib/server/repo';

export const load: PageServerLoad = async () => {
	return { rooms: listRooms() };
};
