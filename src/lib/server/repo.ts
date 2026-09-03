import { dbReady } from './db';

export type Room = {
	id: number;
	slug: string;
	name: string;
	summary: string;
	rate_usd: number;
	image: string;
	guests: string;
	bed: string;
	bathroom: string;
	is_available: boolean;
	position: number;
};

export type Enquiry = {
	id: number;
	kind: 'booking' | 'contact';
	name: string;
	email: string;
	phone: string | null;
	room_slug: string | null;
	check_in: string | null;
	check_out: string | null;
	guests: number | null;
	message: string | null;
	status: 'new' | 'read' | 'replied' | 'archived';
	created_at: string;
};

export type GalleryImage = {
	id: number;
	src: string;
	alt: string;
	grouping: string;
	position: number;
};

export type EnquiryStatus = Enquiry['status'];

/** Dates come back as `Date`; the pages and the API want plain ISO days. */
function isoDay(value: Date | string | null): string | null {
	if (!value) return null;
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return value;
}

function toEnquiry(row: Record<string, unknown>): Enquiry {
	return {
		...(row as unknown as Enquiry),
		check_in: isoDay(row.check_in as Date | null),
		check_out: isoDay(row.check_out as Date | null),
		created_at:
			row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
	};
}

export async function listRooms(): Promise<Room[]> {
	const sql = await dbReady();
	return sql<Room[]>`SELECT * FROM rooms ORDER BY position ASC, id ASC`;
}

export async function listAvailableRooms(): Promise<Room[]> {
	const sql = await dbReady();
	return sql<Room[]>`
		SELECT * FROM rooms WHERE is_available ORDER BY position ASC, id ASC
	`;
}

export async function getRoom(slug: string): Promise<Room | undefined> {
	const sql = await dbReady();
	const [room] = await sql<Room[]>`SELECT * FROM rooms WHERE slug = ${slug}`;
	return room;
}

export async function updateRoom(
	slug: string,
	fields: { rate_usd: number; guests: string; bed: string; bathroom: string; is_available: boolean }
) {
	const sql = await dbReady();
	return sql`
		UPDATE rooms
		   SET rate_usd     = ${fields.rate_usd},
		       guests       = ${fields.guests},
		       bed          = ${fields.bed},
		       bathroom     = ${fields.bathroom},
		       is_available = ${fields.is_available}
		 WHERE slug = ${slug}
	`;
}

export async function listGallery(): Promise<GalleryImage[]> {
	const sql = await dbReady();
	return sql<GalleryImage[]>`
		SELECT * FROM gallery_images ORDER BY position ASC, id ASC
	`;
}

export async function groupedGallery(): Promise<{ grouping: string; images: GalleryImage[] }[]> {
	const groups = new Map<string, GalleryImage[]>();
	for (const image of await listGallery()) {
		const bucket = groups.get(image.grouping) ?? [];
		bucket.push(image);
		groups.set(image.grouping, bucket);
	}
	return [...groups].map(([grouping, images]) => ({ grouping, images }));
}

export async function createEnquiry(input: {
	kind: 'booking' | 'contact';
	name: string;
	email: string;
	phone?: string | null;
	roomSlug?: string | null;
	checkIn?: string | null;
	checkOut?: string | null;
	guests?: number | null;
	message?: string | null;
}): Promise<number> {
	const sql = await dbReady();
	const [row] = await sql<{ id: number }[]>`
		INSERT INTO enquiries (kind, name, email, phone, room_slug, check_in, check_out, guests, message)
		VALUES (
			${input.kind},
			${input.name},
			${input.email},
			${input.phone ?? null},
			${input.roomSlug ?? null},
			${input.checkIn ?? null},
			${input.checkOut ?? null},
			${input.guests ?? null},
			${input.message ?? null}
		)
		RETURNING id
	`;
	return row.id;
}

export async function listEnquiries(status?: EnquiryStatus): Promise<Enquiry[]> {
	const sql = await dbReady();
	const rows = status
		? await sql`
				SELECT * FROM enquiries
				 WHERE status = ${status}
				 ORDER BY created_at DESC, id DESC
			`
		: await sql`
				SELECT * FROM enquiries
				 WHERE status <> 'archived'
				 ORDER BY created_at DESC, id DESC
			`;
	return rows.map((row) => toEnquiry(row as Record<string, unknown>));
}

export async function setEnquiryStatus(id: number, status: EnquiryStatus) {
	const sql = await dbReady();
	return sql`UPDATE enquiries SET status = ${status} WHERE id = ${id}`;
}

export async function enquiryCounts(): Promise<Record<string, number>> {
	const sql = await dbReady();
	const rows = await sql<{ status: string; n: string }[]>`
		SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status
	`;
	const counts: Record<string, number> = { new: 0, read: 0, replied: 0, archived: 0 };
	for (const row of rows) counts[row.status] = Number(row.n);
	return counts;
}
