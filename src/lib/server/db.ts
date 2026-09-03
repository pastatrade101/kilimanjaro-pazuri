import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '$env/dynamic/private';

const file = env.DATABASE_PATH || 'data/kilimanjaro-pazuri.db';

if (file !== ':memory:' && !existsSync(dirname(file))) {
	mkdirSync(dirname(file), { recursive: true });
}

export const db = new Database(file);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
	CREATE TABLE IF NOT EXISTS rooms (
		id           INTEGER PRIMARY KEY AUTOINCREMENT,
		slug         TEXT NOT NULL UNIQUE,
		name         TEXT NOT NULL,
		summary      TEXT NOT NULL,
		rate_usd     INTEGER NOT NULL,
		image        TEXT NOT NULL,
		guests       TEXT NOT NULL DEFAULT 'To be confirmed',
		bed          TEXT NOT NULL DEFAULT 'To be confirmed',
		bathroom     TEXT NOT NULL DEFAULT 'Private',
		is_available INTEGER NOT NULL DEFAULT 1,
		position     INTEGER NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS enquiries (
		id          INTEGER PRIMARY KEY AUTOINCREMENT,
		kind        TEXT NOT NULL CHECK (kind IN ('booking', 'contact')),
		name        TEXT NOT NULL,
		email       TEXT NOT NULL,
		phone       TEXT,
		room_slug   TEXT,
		check_in    TEXT,
		check_out   TEXT,
		guests      INTEGER,
		message     TEXT,
		status      TEXT NOT NULL DEFAULT 'new'
		              CHECK (status IN ('new', 'read', 'replied', 'archived')),
		created_at  TEXT NOT NULL DEFAULT (datetime('now'))
	);

	CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at DESC);
	CREATE INDEX IF NOT EXISTS idx_enquiries_status  ON enquiries (status);

	CREATE TABLE IF NOT EXISTS gallery_images (
		id       INTEGER PRIMARY KEY AUTOINCREMENT,
		src      TEXT NOT NULL UNIQUE,
		alt      TEXT NOT NULL,
		grouping TEXT NOT NULL,
		position INTEGER NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS sessions (
		id         TEXT PRIMARY KEY,
		username   TEXT NOT NULL,
		expires_at INTEGER NOT NULL
	);
`);

/**
 * The six rooms, their rates and their photographs, exactly as set out in the
 * brand deck. Seeded once; after that the admin area is the source of truth.
 */
const seedRooms = [
	{
		slug: 'seluhi',
		name: 'Seluhi Room',
		summary: 'A comfortable retreat for a relaxed stay in Moshi.',
		rate: 45,
		image: '/assets/images/villa/room-1.jpg'
	},
	{
		slug: 'serengeti',
		name: 'Serengeti Room',
		summary: "A welcoming room inspired by Tanzania's most iconic destination.",
		rate: 45,
		image: '/assets/images/villa/room-2.jpg'
	},
	{
		slug: 'tarangire',
		name: 'Tarangire Room',
		summary: 'A calm space for resting between your northern Tanzania adventures.',
		rate: 45,
		image: '/assets/images/villa/room-3.jpg'
	},
	{
		slug: 'kilimanjaro',
		name: 'Kilimanjaro Room',
		summary: 'A fitting base for guests drawn to the mountain and its foothills.',
		rate: 45,
		image: '/assets/images/villa/room-4.jpg'
	},
	{
		slug: 'zanzibar',
		name: 'Zanzibar Room',
		summary: 'A premium room with the character of the Swahili coast.',
		rate: 60,
		image: '/assets/images/villa/room-5.jpg'
	},
	{
		slug: 'mikumi',
		name: 'Mikumi Room',
		summary: 'A great-value room for travellers seeking a peaceful night in Moshi.',
		rate: 35,
		image: '/assets/images/villa/room-6.jpg'
	}
];

const seedGallery = [
	{ src: '/assets/images/villa/hero-garden-suite.jpg', alt: 'The garden suite', grouping: 'The rooms' },
	{ src: '/assets/images/villa/room-1.jpg', alt: 'Seluhi Room', grouping: 'The rooms' },
	{ src: '/assets/images/villa/room-2.jpg', alt: 'Serengeti Room', grouping: 'The rooms' },
	{ src: '/assets/images/villa/room-3.jpg', alt: 'Tarangire Room', grouping: 'The rooms' },
	{ src: '/assets/images/villa/room-4.jpg', alt: 'Kilimanjaro Room', grouping: 'The rooms' },
	{ src: '/assets/images/villa/room-5.jpg', alt: 'Zanzibar Room', grouping: 'The rooms' },
	{ src: '/assets/images/villa/room-6.jpg', alt: 'Mikumi Room', grouping: 'The rooms' },
	{ src: '/assets/images/villa/kitchen.jpg', alt: 'The villa kitchen', grouping: 'The villa' },
	{ src: '/assets/images/villa/dining.jpg', alt: 'The dining room', grouping: 'The villa' },
	{ src: '/assets/images/villa/gallery-6.jpg', alt: 'Seating in the villa', grouping: 'The villa' },
	{ src: '/assets/images/villa/gallery-7.jpg', alt: 'A quiet corner of the villa', grouping: 'The villa' },
	{ src: '/assets/images/villa/gallery-3.jpg', alt: 'Villa doors', grouping: 'The villa' },
	{ src: '/assets/images/villa/gallery-8.jpg', alt: 'The villa corridor', grouping: 'The villa' },
	{ src: '/assets/images/villa/shower.jpg', alt: 'A guest shower', grouping: 'Guest amenities' },
	{ src: '/assets/images/villa/gallery-4.jpg', alt: 'A guest bathroom', grouping: 'Guest amenities' },
	{ src: '/assets/images/villa/gallery-1.jpg', alt: 'A bed beneath its mosquito net', grouping: 'Guest amenities' },
	{ src: '/assets/images/villa/gallery-2.jpg', alt: 'Kanga textiles on a guest bed', grouping: 'Guest amenities' },
	{ src: '/assets/images/villa/gallery-5.jpg', alt: 'A cot, available on request', grouping: 'Guest amenities' }
];

const roomCount = db.prepare('SELECT COUNT(*) AS n FROM rooms').get() as { n: number };
if (roomCount.n === 0) {
	const insert = db.prepare(
		`INSERT INTO rooms (slug, name, summary, rate_usd, image, position)
		 VALUES (@slug, @name, @summary, @rate, @image, @position)`
	);
	db.transaction(() => {
		seedRooms.forEach((room, i) => insert.run({ ...room, position: i }));
	})();
}

const galleryCount = db.prepare('SELECT COUNT(*) AS n FROM gallery_images').get() as { n: number };
if (galleryCount.n === 0) {
	const insert = db.prepare(
		`INSERT INTO gallery_images (src, alt, grouping, position)
		 VALUES (@src, @alt, @grouping, @position)`
	);
	db.transaction(() => {
		seedGallery.forEach((image, i) => insert.run({ ...image, position: i }));
	})();
}
