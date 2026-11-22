import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getRoom, listAvailableRooms, listRoomImages } from '$lib/server/repo';
import { validateBooking, type Issues } from '$lib/server/validate';
import { limitEnquiries } from '$lib/server/ratelimit';
import { createBooking, takenSpans, today, DatesTakenError } from '$lib/server/bookings';
import {
	sendInBackground,
	ownerAlert,
	guestAcknowledgement,
	ownerAddress,
	replyAddress
} from '$lib/server/mail';
import { site } from '$lib/content/site';

/** How far ahead the calendar shows nights that are already spoken for. */
const HORIZON_DAYS = 400;

function addDays(iso: string, days: number): string {
	const date = new Date(iso + 'T00:00:00Z');
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

export const load: PageServerLoad = async ({ params }) => {
	const room = await getRoom(params.slug);
	if (!room) error(404, 'We could not find that room.');

	const others = (await listAvailableRooms()).filter((r) => r.slug !== room.slug).slice(0, 3);

	const from = today();
	return {
		room,
		others,
		images: await listRoomImages(params.slug),
		// The form greys these out before the guest picks, rather than letting
		// them fill the whole thing in and then be told no.
		taken: await takenSpans(params.slug, from, addDays(from, HORIZON_DAYS)),
		from,
		until: addDays(from, HORIZON_DAYS)
	};
};

export const actions: Actions = {
	default: async ({ request, params, getClientAddress }) => {
		const limit = limitEnquiries(getClientAddress());
		if (!limit.allowed) {
			const issues: Issues = {
				form: 'Too many requests from this connection. Please try again shortly.'
			};
			return fail(429, { issues, values: {} as Record<string, string> });
		}

		// The slug reaches here from the URL; a room that has since been removed
		// must not silently take bookings.
		const room = await getRoom(params.slug);
		if (!room) {
			const issues: Issues = { form: 'That room is no longer available.' };
			return fail(404, { issues, values: {} as Record<string, string> });
		}

		const data = await request.formData();
		data.set('room', params.slug);

		const result = validateBooking(data);
		if (!result.ok) return fail(400, { issues: result.issues, values: result.values });

		try {
			const booking = await createBooking(result.value);

			/*
			 * Started, never awaited. The nights are already held; whether a
			 * message about them gets out is a lesser matter than leaving the
			 * guest staring at a spinner because a mail provider is slow.
			 */
			const mail = {
				reference: booking.reference,
				roomName: room.name,
				checkIn: result.value.checkIn,
				checkOut: result.value.checkOut,
				nights: booking.nights,
				guests: result.value.guests,
				total: booking.total,
				name: result.value.name,
				email: result.value.email,
				phone: result.value.phone,
				message: result.value.message
			};
			sendInBackground(ownerAlert(mail, ownerAddress(site.email)));
			sendInBackground(guestAcknowledgement(mail, replyAddress(site.email)));

			return {
				success: true,
				reference: booking.reference,
				total: booking.total,
				nights: booking.nights
			};
		} catch (cause) {
			// Someone took the nights between the page loading and this submit.
			// The database decided it, so the guest is told the truth.
			if (cause instanceof DatesTakenError) {
				return fail(409, {
					issues: { form: cause.message } as Issues,
					values: result.value as unknown as Record<string, string>
				});
			}
			throw cause;
		}
	}
};
