import { env } from '$env/dynamic/private';

/**
 * Email through Resend, over plain fetch — no dependency, and nothing to keep
 * alive between requests the way an SMTP pool would.
 *
 * Two rules hold this file together:
 *
 *   1. Email never fails a booking. The guest has the room; whether the owner
 *      got a message about it is a separate, lesser concern. Every send is
 *      awaited nowhere and throws nowhere.
 *   2. With no API key it does nothing but say so in the log, so the site runs
 *      perfectly well before anyone has signed up to anything.
 */

const ENDPOINT = 'https://api.resend.com/emails';

type Mail = {
	to: string | string[];
	subject: string;
	html: string;
	text: string;
	replyTo?: string;
};

function configured(): { key: string; from: string } | null {
	const key = env.RESEND_API_KEY;
	// Resend will only accept a `from` on a domain the account has verified.
	const from = env.MAIL_FROM;
	if (!key || !from) return null;
	return { key, from };
}

/**
 * Where the villa's own alerts go. MAIL_TO takes a comma-separated list, so an
 * alert can land in more than one inbox — worth having while an address is
 * still unproven, since a booking nobody sees is the single failure this whole
 * feature exists to prevent.
 */
export function ownerAddress(fallback: string): string[] {
	const configured = (env.MAIL_TO || fallback)
		.split(',')
		.map((address) => address.trim())
		.filter(Boolean);
	return configured.length > 0 ? configured : [fallback];
}

/**
 * Where a guest's reply lands. The `from` address is a sending domain and may
 * not take incoming mail, so every message to a guest carries this instead.
 */
export function replyAddress(fallback: string): string {
	// A reply has one destination, so the first address wins if several are set.
	const configured = env.MAIL_REPLY_TO || env.MAIL_TO || fallback;
	return configured.split(',')[0].trim() || fallback;
}

/**
 * Sends, and resolves either way. Callers are not meant to await this; it is
 * started and left to finish on its own.
 */
export async function send(mail: Mail): Promise<boolean> {
	const config = configured();
	if (!config) {
		const to = Array.isArray(mail.to) ? mail.to.join(', ') : mail.to;
		console.info(`[mail] not configured — would have sent "${mail.subject}" to ${to}`);
		return false;
	}

	try {
		const response = await fetch(ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${config.key}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: config.from,
				to: Array.isArray(mail.to) ? mail.to : [mail.to],
				subject: mail.subject,
				html: mail.html,
				text: mail.text,
				...(mail.replyTo ? { reply_to: mail.replyTo } : {})
			}),
			// A hung mail provider must not hold a request open.
			signal: AbortSignal.timeout(10_000)
		});

		if (!response.ok) {
			const body = await response.text().catch(() => '');
			console.warn(`[mail] ${response.status} sending "${mail.subject}": ${body.slice(0, 300)}`);
			return false;
		}
		return true;
	} catch (error) {
		console.warn(`[mail] failed to send "${mail.subject}":`, (error as Error).message);
		return false;
	}
}

/** Starts a send and returns at once, swallowing anything it throws. */
export function sendInBackground(mail: Mail): void {
	void send(mail).catch(() => {});
}

/* ------------------------------------------------------------- templates */

const BLUE = '#0f4d92';
const INK = '#3f566b';

function escape(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function layout(heading: string, body: string): string {
	return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f9fc;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;">
<tr><td style="background:${BLUE};padding:20px 28px;color:#ffffff;font-size:17px;letter-spacing:0.02em;">Kilimanjaro Pazuri Villas</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:21px;font-weight:600;color:${BLUE};">${escape(heading)}</h1>
${body}
</td></tr>
<tr><td style="padding:16px 28px;background:#f4f9fc;font-size:12px;color:#5a7288;">Moshi, Tanzania · kilimanjaropazurivilla.com</td></tr>
</table></body></html>`;
}

function rows(pairs: [string, string][]): string {
	return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse;">${pairs
		.map(
			([k, v]) =>
				`<tr><td style="padding:7px 0;color:#5a7288;width:40%;">${escape(k)}</td><td style="padding:7px 0;color:${INK};font-weight:600;">${escape(v)}</td></tr>`
		)
		.join('')}</table>`;
}

export type BookingMail = {
	reference: string;
	roomName: string;
	checkIn: string;
	checkOut: string;
	nights: number;
	guests: number;
	total: number;
	name: string;
	email: string;
	phone?: string | null;
	message?: string | null;
};

const stay = (b: BookingMail): [string, string][] => [
	['Reference', b.reference],
	['Room', b.roomName],
	['Arrival', b.checkIn],
	['Departure', b.checkOut],
	['Nights', String(b.nights)],
	['Guests', String(b.guests)],
	['Total', `$${b.total} USD, payable at the villa`]
];

/** To the villa: someone has just taken nights off the calendar. */
export function ownerAlert(b: BookingMail, to: string | string[]): Mail {
	const contact: [string, string][] = [
		['Name', b.name],
		['Email', b.email],
		...(b.phone ? ([['Telephone', b.phone]] as [string, string][]) : [])
	];
	return {
		to,
		replyTo: b.email,
		subject: `New booking ${b.reference} — ${b.roomName}, ${b.checkIn}`,
		html: layout(
			'A new booking is waiting for you',
			`<p style="margin:0 0 18px;font-size:14px;">These nights are held. Confirm or decline in the admin area.</p>
			${rows(stay(b))}
			<h2 style="margin:22px 0 10px;font-size:15px;color:${BLUE};">Guest</h2>
			${rows(contact)}
			${b.message ? `<p style="margin:18px 0 0;padding:14px;background:#f4f9fc;border-left:3px solid ${BLUE};font-size:14px;">${escape(b.message)}</p>` : ''}
			<p style="margin:24px 0 0;"><a href="https://kilimanjaropazurivilla.com/admin/bookings" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:14px;">Open bookings</a></p>`
		),
		text:
			`New booking ${b.reference}\n\n` +
			stay(b)
				.map(([k, v]) => `${k}: ${v}`)
				.join('\n') +
			`\n\nGuest: ${b.name} <${b.email}>${b.phone ? ` / ${b.phone}` : ''}` +
			(b.message ? `\n\nMessage: ${b.message}` : '') +
			`\n\nConfirm or decline: https://kilimanjaropazurivilla.com/admin/bookings\n`
	};
}

/** To the guest: we have you, and here is what you asked for. */
export function guestAcknowledgement(b: BookingMail, replyTo?: string): Mail {
	return {
		to: b.email,
		replyTo,
		subject: `We have your dates — booking ${b.reference}`,
		html: layout(
			'Your dates are held',
			`<p style="margin:0 0 18px;font-size:14px;">Thank you, ${escape(b.name)}. We are holding the ${escape(b.roomName)} for you and will confirm shortly. Nothing is payable now — you settle at the villa.</p>
			${rows(stay(b))}
			<p style="margin:22px 0 0;font-size:13px;color:#5a7288;">Please quote <strong style="color:${BLUE};">${escape(b.reference)}</strong> in any message to us.</p>`
		),
		text:
			`Thank you, ${b.name}.\n\nWe are holding the ${b.roomName} for you and will confirm shortly. Nothing is payable now — you settle at the villa.\n\n` +
			stay(b)
				.map(([k, v]) => `${k}: ${v}`)
				.join('\n') +
			`\n\nPlease quote ${b.reference} in any message to us.\n`
	};
}

/** To the guest, once the villa has decided. */
export function guestDecision(b: BookingMail, confirmed: boolean, replyTo?: string): Mail {
	return {
		to: b.email,
		replyTo,
		subject: confirmed
			? `Confirmed — your stay at Kilimanjaro Pazuri (${b.reference})`
			: `About your booking ${b.reference}`,
		html: layout(
			confirmed ? 'Your stay is confirmed' : 'We are sorry — those nights are not available',
			confirmed
				? `<p style="margin:0 0 18px;font-size:14px;">We look forward to welcoming you, ${escape(b.name)}. Payment is made at the villa.</p>${rows(stay(b))}`
				: `<p style="margin:0 0 18px;font-size:14px;">We are sorry, ${escape(b.name)} — we are not able to take these dates after all, and the nights have been released. Please do write to us; we may be able to suggest an alternative.</p>${rows(stay(b))}`
		),
		text: confirmed
			? `Your stay is confirmed.\n\n` +
				stay(b)
					.map(([k, v]) => `${k}: ${v}`)
					.join('\n') +
				`\n\nPayment is made at the villa. We look forward to welcoming you.\n`
			: `We are sorry — we are not able to take these dates after all, and the nights have been released.\n\n` +
				stay(b)
					.map(([k, v]) => `${k}: ${v}`)
					.join('\n') +
				`\n\nPlease write to us; we may be able to suggest an alternative.\n`
	};
}
