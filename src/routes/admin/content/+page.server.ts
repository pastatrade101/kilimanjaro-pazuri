import type { PageServerLoad } from './$types';
import { editableFields, overrideCount } from '$lib/server/content';

const TITLES: Record<string, { title: string; blurb: string }> = {
	site: { title: 'The villa', blurb: 'Name, voice and how guests reach you. Used on every page.' },
	home: { title: 'Home', blurb: 'The first screen, the welcome, and what leads guests to the rooms.' },
	rooms: { title: 'Rooms and Rates', blurb: 'The listing, and the wording shared by every room page.' },
	about: { title: 'About', blurb: 'The story of the villa.' },
	amenities: { title: 'Amenities', blurb: 'What the villa offers.' },
	gallery: { title: 'Gallery', blurb: 'The photography, grouped as the villa is lived.' },
	location: { title: 'Location', blurb: 'Where the villa is, and how far things are.' },
	contact: { title: 'Contact', blurb: 'The invitation to get in touch.' },
	booking: { title: 'Booking invitation', blurb: 'The closing call that appears on most pages.' },
	footer: { title: 'Footer', blurb: 'Repeated at the foot of every page.' },
	seo: { title: 'Search', blurb: 'How the villa appears in search results and when shared.' },
	actions: { title: 'Buttons', blurb: 'The wording of the two actions carried across the site.' },
	images: { title: 'Photographs', blurb: 'Every photograph the pages place. Upload a new one to replace it.' }
};

export const load: PageServerLoad = async () => {
	const counts = new Map<string, number>();
	for (const field of editableFields()) {
		const page = field.key.split('.')[0];
		counts.set(page, (counts.get(page) ?? 0) + 1);
	}

	const pages = [...counts].map(([key, fields]) => ({
		key,
		fields,
		title: TITLES[key]?.title ?? key,
		blurb: TITLES[key]?.blurb ?? ''
	}));

	return { pages, edited: await overrideCount() };
};
