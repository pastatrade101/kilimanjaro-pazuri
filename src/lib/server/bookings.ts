import { randomInt } from 'node:crypto';
import { dbReady } from './db';

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'blocked';

export type Booking = {
	id: number;
	reference: string;
	kind: 'booking' | 'block';
	room_slug: string;
	room_name?: string;
	check_in: string;
	check_out: string;
	nights: number;
	guests: number;
	guest_name: string | null;
	email: string | null;
	phone: string | null;
	message: string;
	rate_usd: number;
	total_usd: number;
	status: BookingStatus;
	note: string;
	created_at: string;
};

/** The statuses that actually hold a room, and so block another booking. */
export const HOLDING: BookingStatus[] = ['pending', 'confirmed', 'blocked'];

/** Raised when the dates were taken between the guest looking and submitting. */
export class DatesTakenError extends Error {
	constructor() {
		super('Those nights have just been taken. Please choose different dates.');
	}
}

/**
 * No I, O, 0 or 1: a guest reads this over the telephone or copies it off a
 * screen, and those four are the ones that get heard wrong.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newReference(): string {
	let out = '';
	for (let i = 0; i < 6; i++) out += ALPHABET[randomInt(ALPHABET.length)];
	return `KP-${out}`;
}

/** Whole nights between two ISO dates. Half-open, so arrival to next morning is one. */
export function nights(checkIn: string, checkOut: string): number {
	const a = Date.parse(`${checkIn}T00:00:00Z`);
	const b = Date.parse(`${checkOut}T00:00:00Z`);
	if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
	return Math.round((b - a) / 86_400_000);
}

/** Today in Africa/Dar_es_Salaam, as the guest's calendar sees it. */
export function today(): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Dar_es_Salaam' }).format(new Date());
}

/**
 * Whether a room is free for the whole span. The booking insert does not rely
 * on this — the database refuses an overlap on its own — but the form uses it
 * to answer before the guest fills anything in.
 */
export async function isFree(roomSlug: string, checkIn: string, checkOut: string): Promise<boolean> {
	const sql = await dbReady();
	const [row] = await sql<{ taken: boolean }[]>`
		SELECT EXISTS (
			SELECT 1 FROM bookings
			 WHERE room_slug = ${roomSlug}
			   AND status = ANY(${HOLDING})
			   AND daterange(check_in, check_out, '[)') && daterange(${checkIn}::date, ${checkOut}::date, '[)')
		) AS taken
	`;
	return !row.taken;
}

/** The spans a room is already spoken for, to grey out in a calendar. */
export async function takenSpans(
	roomSlug: string,
	from: string,
	to: string
): Promise<{ check_in: string; check_out: string }[]> {
	const sql = await dbReady();
	return sql<{ check_in: string; check_out: string }[]>`
		SELECT to_char(check_in, 'YYYY-MM-DD') AS check_in,
		       to_char(check_out, 'YYYY-MM-DD') AS check_out
		  FROM bookings
		 WHERE room_slug = ${roomSlug}
		   AND status = ANY(${HOLDING})
		   AND daterange(check_in, check_out, '[)') && daterange(${from}::date, ${to}::date, '[)')
		 ORDER BY check_in
	`;
}

/**
 * Holds the nights and returns the reference. The room's current rate is
 * captured here so a later price change cannot rewrite what was quoted.
 */
export async function createBooking(input: {
	roomSlug: string;
	checkIn: string;
	checkOut: string;
	guests: number;
	name: string;
	email: string;
	phone?: string | null;
	message?: string | null;
}): Promise<{ reference: string; total: number; nights: number }> {
	const sql = await dbReady();

	const [room] = await sql<{ rate_usd: number }[]>`
		SELECT rate_usd FROM rooms WHERE slug = ${input.roomSlug}
	`;
	if (!room) throw new Error('Unknown room.');

	const stay = nights(input.checkIn, input.checkOut);
	const total = room.rate_usd * stay;

	// A reference collision is vanishingly unlikely but not impossible, and it
	// is a unique column; retrying costs nothing.
	for (let attempt = 0; attempt < 5; attempt++) {
		const reference = newReference();
		try {
			await sql`
				INSERT INTO bookings
					(reference, kind, room_slug, check_in, check_out, guests,
					 guest_name, email, phone, message, rate_usd, total_usd, status)
				VALUES
					(${reference}, 'booking', ${input.roomSlug}, ${input.checkIn}, ${input.checkOut},
					 ${input.guests}, ${input.name}, ${input.email}, ${input.phone ?? null},
					 ${input.message ?? ''}, ${room.rate_usd}, ${total}, 'pending')
			`;
			return { reference, total, nights: stay };
		} catch (error) {
			const code = (error as { code?: string }).code;
			// 23P01: the exclusion constraint refused an overlap.
			if (code === '23P01') throw new DatesTakenError();
			// 23505: the reference was already used — try another.
			if (code === '23505' && attempt < 4) continue;
			throw error;
		}
	}
	throw new Error('Could not allocate a booking reference.');
}

/** Takes nights off sale. Uses the same table, so it cannot clash with a booking. */
export async function blockNights(input: {
	roomSlug: string;
	from: string;
	to: string;
	reason?: string;
}): Promise<string> {
	const sql = await dbReady();
	const reference = newReference();
	try {
		await sql`
			INSERT INTO bookings
				(reference, kind, room_slug, check_in, check_out, guests, message, status)
			VALUES
				(${reference}, 'block', ${input.roomSlug}, ${input.from}, ${input.to}, 1,
				 ${input.reason ?? ''}, 'blocked')
		`;
		return reference;
	} catch (error) {
		if ((error as { code?: string }).code === '23P01') throw new DatesTakenError();
		throw error;
	}
}

export async function listBookings(status?: BookingStatus): Promise<Booking[]> {
	const sql = await dbReady();
	const rows = await sql<Booking[]>`
		SELECT b.id, b.reference, b.kind, b.room_slug, r.name AS room_name,
		       to_char(b.check_in, 'YYYY-MM-DD') AS check_in,
		       to_char(b.check_out, 'YYYY-MM-DD') AS check_out,
		       (b.check_out - b.check_in) AS nights,
		       b.guests, b.guest_name, b.email, b.phone, b.message,
		       b.rate_usd, b.total_usd, b.status, b.note,
		       to_char(b.created_at, 'YYYY-MM-DD HH24:MI') AS created_at
		  FROM bookings b
		  LEFT JOIN rooms r ON r.slug = b.room_slug
		 ${status ? sql`WHERE b.status = ${status}` : sql``}
		 ORDER BY b.check_in DESC, b.id DESC
		 LIMIT 500
	`;
	return rows.map((r) => ({ ...r, nights: Number(r.nights), id: Number(r.id) }));
}

export async function setBookingStatus(id: number, status: BookingStatus, note?: string) {
	const sql = await dbReady();
	// Moving back into a holding status can collide with whatever took the
	// nights in the meantime; the constraint decides, not us.
	try {
		await sql`
			UPDATE bookings
			   SET status = ${status},
			       note = COALESCE(${note ?? null}, note),
			       updated_at = now()
			 WHERE id = ${id}
		`;
	} catch (error) {
		if ((error as { code?: string }).code === '23P01') throw new DatesTakenError();
		throw error;
	}
}

export async function deleteBooking(id: number) {
	const sql = await dbReady();
	await sql`DELETE FROM bookings WHERE id = ${id}`;
}

export async function bookingCounts(): Promise<Record<string, number>> {
	const sql = await dbReady();
	const rows = await sql<{ status: string; n: string }[]>`
		SELECT status, count(*)::int AS n FROM bookings GROUP BY status
	`;
	return Object.fromEntries(rows.map((r) => [r.status, Number(r.n)]));
}

/** One booking, for the message that follows a decision. */
export async function getBooking(id: number): Promise<Booking | undefined> {
	const sql = await dbReady();
	const [row] = await sql<Booking[]>`
		SELECT b.id, b.reference, b.kind, b.room_slug, r.name AS room_name,
		       to_char(b.check_in, 'YYYY-MM-DD') AS check_in,
		       to_char(b.check_out, 'YYYY-MM-DD') AS check_out,
		       (b.check_out - b.check_in) AS nights,
		       b.guests, b.guest_name, b.email, b.phone, b.message,
		       b.rate_usd, b.total_usd, b.status, b.note,
		       to_char(b.created_at, 'YYYY-MM-DD HH24:MI') AS created_at
		  FROM bookings b
		  LEFT JOIN rooms r ON r.slug = b.room_slug
		 WHERE b.id = ${id}
	`;
	return row ? { ...row, id: Number(row.id), nights: Number(row.nights) } : undefined;
}
