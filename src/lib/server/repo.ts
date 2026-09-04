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

/**
 * `bigint` arrives as a string, because Postgres allows values a JS number
 * cannot hold. These ids are small and the API contract says number, so they
 * are narrowed here rather than leaking `"1"` into JSON.
 */
function toRoom(row: Record<string, unknown>): Room {
	return { ...(row as unknown as Room), id: Number(row.id) };
}

/** Dates come back as `Date`; the pages and the API want plain ISO days. */
function isoDay(value: Date | string | null): string | null {
	if (!value) return null;
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return value;
}

function toEnquiry(row: Record<string, unknown>): Enquiry {
	return {
		...(row as unknown as Enquiry),
		id: Number(row.id),
		check_in: isoDay(row.check_in as Date | null),
		check_out: isoDay(row.check_out as Date | null),
		created_at:
			row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
	};
}

export async function listRooms(): Promise<Room[]> {
	const sql = await dbReady();
	const rows = await sql`SELECT * FROM rooms ORDER BY position ASC, id ASC`;
	return rows.map((row) => toRoom(row as Record<string, unknown>));
}

export async function listAvailableRooms(): Promise<Room[]> {
	const sql = await dbReady();
	const rows = await sql`
		SELECT * FROM rooms WHERE is_available ORDER BY position ASC, id ASC
	`;
	return rows.map((row) => toRoom(row as Record<string, unknown>));
}

export async function getRoom(slug: string): Promise<Room | undefined> {
	const sql = await dbReady();
	const [room] = await sql`SELECT * FROM rooms WHERE slug = ${slug}`;
	return room ? toRoom(room as Record<string, unknown>) : undefined;
}

export async function updateRoom(
	slug: string,
	fields: {
		name: string;
		summary: string;
		image: string;
		rate_usd: number;
		guests: string;
		bed: string;
		bathroom: string;
		is_available: boolean;
	}
) {
	const sql = await dbReady();
	// The slug is deliberately not editable: it is the room's URL, and it is
	// what past enquiries recorded. Renaming a room changes what guests read,
	// not where the page lives.
	return sql`
		UPDATE rooms
		   SET name         = ${fields.name},
		       summary      = ${fields.summary},
		       image        = ${fields.image},
		       rate_usd     = ${fields.rate_usd},
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
	const [row] = await sql<{ id: string }[]>`
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
	return Number(row.id);
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

export async function createGalleryImage(input: {
	src: string;
	alt: string;
	grouping: string;
}): Promise<number> {
	const sql = await dbReady();
	const [row] = await sql<{ id: string }[]>`
		INSERT INTO gallery_images (src, alt, grouping, position)
		VALUES (
			${input.src}, ${input.alt}, ${input.grouping},
			COALESCE((SELECT MAX(position) + 1 FROM gallery_images), 0)
		)
		ON CONFLICT (src) DO UPDATE SET alt = EXCLUDED.alt, grouping = EXCLUDED.grouping
		RETURNING id
	`;
	return Number(row.id);
}

export async function updateGalleryImage(
	id: number,
	fields: { alt: string; grouping: string }
) {
	const sql = await dbReady();
	return sql`
		UPDATE gallery_images
		   SET alt = ${fields.alt}, grouping = ${fields.grouping}
		 WHERE id = ${id}
	`;
}

export async function deleteGalleryImage(id: number) {
	const sql = await dbReady();
	return sql`DELETE FROM gallery_images WHERE id = ${id}`;
}

/** Swaps an image with its neighbour, so the order is the owner's to set. */
export async function moveGalleryImage(id: number, direction: 'up' | 'down') {
	const sql = await dbReady();
	const images = await listGallery();
	const index = images.findIndex((image) => image.id === id);
	const target = index + (direction === 'up' ? -1 : 1);
	if (index < 0 || target < 0 || target >= images.length) return;

	await sql.begin(async (tx) => {
		await tx`UPDATE gallery_images SET position = ${images[target].position} WHERE id = ${images[index].id}`;
		await tx`UPDATE gallery_images SET position = ${images[index].position} WHERE id = ${images[target].id}`;
	});
}

export async function createRoom(input: {
	slug: string;
	name: string;
	summary: string;
	rate_usd: number;
	image: string;
}): Promise<void> {
	const sql = await dbReady();
	await sql`
		INSERT INTO rooms (slug, name, summary, rate_usd, image, position)
		VALUES (
			${input.slug}, ${input.name}, ${input.summary}, ${input.rate_usd}, ${input.image},
			COALESCE((SELECT MAX(position) + 1 FROM rooms), 0)
		)
	`;
}

export async function deleteRoom(slug: string) {
	const sql = await dbReady();
	// Past enquiries keep the slug as plain text, so their record survives.
	return sql`DELETE FROM rooms WHERE slug = ${slug}`;
}
