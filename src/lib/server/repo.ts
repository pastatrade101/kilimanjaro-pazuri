import { db } from './db';

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
	is_available: number;
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

export function listRooms(): Room[] {
	return db
		.prepare('SELECT * FROM rooms ORDER BY position ASC, id ASC')
		.all() as Room[];
}

export function listAvailableRooms(): Room[] {
	return db
		.prepare('SELECT * FROM rooms WHERE is_available = 1 ORDER BY position ASC, id ASC')
		.all() as Room[];
}

export function getRoom(slug: string): Room | undefined {
	return db.prepare('SELECT * FROM rooms WHERE slug = ?').get(slug) as Room | undefined;
}

export function updateRoom(
	slug: string,
	fields: { rate_usd: number; guests: string; bed: string; bathroom: string; is_available: number }
) {
	return db
		.prepare(
			`UPDATE rooms
			    SET rate_usd = @rate_usd, guests = @guests, bed = @bed,
			        bathroom = @bathroom, is_available = @is_available
			  WHERE slug = @slug`
		)
		.run({ ...fields, slug });
}

export function listGallery(): GalleryImage[] {
	return db
		.prepare('SELECT * FROM gallery_images ORDER BY position ASC, id ASC')
		.all() as GalleryImage[];
}

export function groupedGallery(): { grouping: string; images: GalleryImage[] }[] {
	const groups = new Map<string, GalleryImage[]>();
	for (const image of listGallery()) {
		const bucket = groups.get(image.grouping) ?? [];
		bucket.push(image);
		groups.set(image.grouping, bucket);
	}
	return [...groups].map(([grouping, images]) => ({ grouping, images }));
}

export function createEnquiry(input: {
	kind: 'booking' | 'contact';
	name: string;
	email: string;
	phone?: string | null;
	roomSlug?: string | null;
	checkIn?: string | null;
	checkOut?: string | null;
	guests?: number | null;
	message?: string | null;
}): number {
	const result = db
		.prepare(
			`INSERT INTO enquiries (kind, name, email, phone, room_slug, check_in, check_out, guests, message)
			 VALUES (@kind, @name, @email, @phone, @roomSlug, @checkIn, @checkOut, @guests, @message)`
		)
		.run({
			kind: input.kind,
			name: input.name,
			email: input.email,
			phone: input.phone ?? null,
			roomSlug: input.roomSlug ?? null,
			checkIn: input.checkIn ?? null,
			checkOut: input.checkOut ?? null,
			guests: input.guests ?? null,
			message: input.message ?? null
		});
	return Number(result.lastInsertRowid);
}

export function listEnquiries(status?: Enquiry['status']): Enquiry[] {
	if (status) {
		return db
			.prepare('SELECT * FROM enquiries WHERE status = ? ORDER BY created_at DESC, id DESC')
			.all(status) as Enquiry[];
	}
	return db
		.prepare("SELECT * FROM enquiries WHERE status != 'archived' ORDER BY created_at DESC, id DESC")
		.all() as Enquiry[];
}

export function setEnquiryStatus(id: number, status: Enquiry['status']) {
	return db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(status, id);
}

export function enquiryCounts() {
	const rows = db
		.prepare('SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status')
		.all() as { status: string; n: number }[];
	const counts: Record<string, number> = { new: 0, read: 0, replied: 0, archived: 0 };
	for (const row of rows) counts[row.status] = row.n;
	return counts;
}
