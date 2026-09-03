import type { PageServerLoad } from './$types';
import { groupedGallery } from '$lib/server/repo';

export const load: PageServerLoad = async () => {
	return { groups: await groupedGallery() };
};
