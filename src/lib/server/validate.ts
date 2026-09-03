/** Small, dependency-free validation for the two public forms. */

export type Issues = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The shape alone would accept 2026-02-31, so the calendar is asked too. */
function isRealDate(value: string): boolean {
	if (!ISO_DATE.test(value)) return false;
	const date = new Date(value + 'T00:00:00Z');
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function addYears(iso: string, years: number): string {
	const date = new Date(iso + 'T00:00:00Z');
	date.setUTCFullYear(date.getUTCFullYear() + years);
	return date.toISOString().slice(0, 10);
}

function text(value: FormDataEntryValue | null): string {
	return typeof value === 'string' ? value.trim() : '';
}

export function validateEnquiry(
	data: FormData,
	kind: 'booking' | 'contact'
): { ok: true; value: EnquiryInput } | { ok: false; issues: Issues; values: Record<string, string> } {
	const issues: Issues = {};

	const name = text(data.get('name'));
	const email = text(data.get('email'));
	const phone = text(data.get('phone'));
	const message = text(data.get('message'));
	const roomSlug = text(data.get('room'));
	const checkIn = text(data.get('check_in'));
	const checkOut = text(data.get('check_out'));
	const guestsRaw = text(data.get('guests'));

	if (name.length < 2) issues.name = 'Please tell us your name.';
	else if (name.length > 120) issues.name = 'That name is too long.';

	if (!email) issues.email = 'Please leave an email address so we can reply.';
	else if (!EMAIL.test(email) || email.length > 200) issues.email = 'That email address does not look right.';

	if (phone && phone.length > 40) issues.phone = 'That telephone number is too long.';
	if (message.length > 4000) issues.message = 'Please keep your message under 4000 characters.';
	if (kind === 'contact' && message.length < 5) issues.message = 'Please tell us a little about your stay.';

	if (roomSlug && (roomSlug.length > 60 || !/^[a-z0-9-]+$/.test(roomSlug))) {
		issues.room = 'Please choose one of our rooms.';
	}

	if (checkIn && !isRealDate(checkIn)) issues.check_in = 'Please choose an arrival date.';
	if (checkOut && !isRealDate(checkOut)) issues.check_out = 'Please choose a departure date.';

	// A stay in the past, or years out, is a mistake worth catching here.
	const today = new Date().toISOString().slice(0, 10);
	if (checkIn && isRealDate(checkIn) && checkIn < today) {
		issues.check_in = 'Please choose a date from today onwards.';
	}
	if (checkIn && isRealDate(checkIn) && checkIn > addYears(today, 3)) {
		issues.check_in = 'Please choose a date within the next three years.';
	}
	if (checkIn && checkOut && isRealDate(checkIn) && isRealDate(checkOut) && checkOut <= checkIn) {
		issues.check_out = 'Your departure date should come after your arrival.';
	}

	let guests: number | null = null;
	if (guestsRaw) {
		const parsed = Number(guestsRaw);
		if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
			issues.guests = 'Please enter a number of guests between 1 and 20.';
		} else {
			guests = parsed;
		}
	}

	// A hidden field no person ever fills in; bots do.
	if (text(data.get('website'))) {
		issues.form = 'Something went wrong. Please try again.';
	}

	const values = { name, email, phone, message, room: roomSlug, check_in: checkIn, check_out: checkOut, guests: guestsRaw };

	if (Object.keys(issues).length > 0) return { ok: false, issues, values };

	return {
		ok: true,
		value: {
			kind,
			name,
			email,
			phone: phone || null,
			roomSlug: roomSlug || null,
			checkIn: checkIn || null,
			checkOut: checkOut || null,
			guests,
			message: message || null
		}
	};
}

export type EnquiryInput = {
	kind: 'booking' | 'contact';
	name: string;
	email: string;
	phone: string | null;
	roomSlug: string | null;
	checkIn: string | null;
	checkOut: string | null;
	guests: number | null;
	message: string | null;
};
