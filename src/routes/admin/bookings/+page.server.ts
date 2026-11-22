import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listRooms } from '$lib/server/repo';
import { sendInBackground, guestDecision, replyAddress } from '$lib/server/mail';
import { site } from '$lib/content/site';
import {
	getBooking,
	listBookings,
	setBookingStatus,
	bookingCounts,
	blockNights,
	deleteBooking,
	today,
	DatesTakenError,
	type BookingStatus
} from '$lib/server/bookings';

const STATUSES = ['pending', 'confirmed', 'declined', 'cancelled', 'blocked'] as const;

export const load: PageServerLoad = async ({ url }) => {
	const filter = url.searchParams.get('status');
	const status = STATUSES.find((s) => s === filter);

	return {
		bookings: await listBookings(status),
		counts: await bookingCounts(),
		rooms: await listRooms(),
		filter: status ?? null,
		today: today()
	};
};

export const actions: Actions = {
	/** Confirm, decline or cancel. */
	status: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const status = String(data.get('status')) as BookingStatus;

		if (!Number.isInteger(id) || !STATUSES.some((s) => s === status)) {
			return fail(400, { error: 'That update was not understood.' });
		}

		try {
			await setBookingStatus(id, status);

			// The guest was told we would write; this is where that happens.
			if (status === 'confirmed' || status === 'declined') {
				const booking = await getBooking(id);
				if (booking && booking.kind === 'booking' && booking.email) {
					sendInBackground(
						guestDecision(
							{
								reference: booking.reference,
								roomName: booking.room_name ?? booking.room_slug,
								checkIn: booking.check_in,
								checkOut: booking.check_out,
								nights: booking.nights,
								guests: booking.guests,
								total: booking.total_usd,
								name: booking.guest_name ?? 'there',
								email: booking.email
							},
							status === 'confirmed',
							replyAddress(site.email)
						)
					);
				}
			}
		} catch (cause) {
			// Reinstating a cancelled booking can collide with whatever took
			// the nights in the meantime.
			if (cause instanceof DatesTakenError) {
				return fail(409, {
					error: 'Those nights now belong to another booking, so this cannot go back.'
				});
			}
			throw cause;
		}
		return { updated: true };
	},

	/** Takes nights off sale — maintenance, the owner's own use, anything. */
	block: async ({ request }) => {
		const data = await request.formData();
		const roomSlug = String(data.get('room') ?? '');
		const from = String(data.get('from') ?? '');
		const to = String(data.get('to') ?? '');
		const reason = String(data.get('reason') ?? '').trim();

		const ISO = /^\d{4}-\d{2}-\d{2}$/;
		if (!roomSlug) return fail(400, { error: 'Choose a room.' });
		if (!ISO.test(from) || !ISO.test(to)) return fail(400, { error: 'Choose both dates.' });
		if (to <= from) return fail(400, { error: 'The last night must come after the first.' });

		try {
			await blockNights({ roomSlug, from, to, reason });
		} catch (cause) {
			if (cause instanceof DatesTakenError) {
				return fail(409, { error: 'Those nights already hold a booking or another block.' });
			}
			throw cause;
		}
		return { blocked: true };
	},

	/** Removes a block outright. Guest bookings are declined or cancelled, never deleted. */
	unblock: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'That block is no longer there.' });
		await deleteBooking(id);
		return { unblocked: true };
	}
};
