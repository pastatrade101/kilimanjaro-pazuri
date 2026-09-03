import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listEnquiries, setEnquiryStatus, enquiryCounts } from '$lib/server/repo';
import { preLaunchChecklist } from '$lib/content/site';

const STATUSES = ['new', 'read', 'replied', 'archived'] as const;

export const load: PageServerLoad = async ({ url }) => {
	const filter = url.searchParams.get('status');
	const status = STATUSES.find((s) => s === filter);

	return {
		enquiries: listEnquiries(status),
		counts: enquiryCounts(),
		filter: status ?? null,
		checklist: preLaunchChecklist
	};
};

export const actions: Actions = {
	status: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const status = String(data.get('status'));

		if (!Number.isInteger(id) || !STATUSES.some((s) => s === status)) {
			return fail(400, { error: 'That update was not understood.' });
		}

		setEnquiryStatus(id, status as (typeof STATUSES)[number]);
		return { updated: true };
	}
};
