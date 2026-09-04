import type { LayoutServerLoad } from './$types';
import { getContent } from '$lib/server/content';

/**
 * The whole site's editable copy, loaded once per request and inherited by
 * every page and component beneath this layout.
 */
export const load: LayoutServerLoad = async () => {
	return { content: await getContent() };
};
