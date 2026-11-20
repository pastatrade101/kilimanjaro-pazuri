import postgres, { type Sql } from 'postgres';
import { env } from '$env/dynamic/private';
// Inlined at build time, so the bundled server carries the schema with it and
// there is still exactly one copy of it — the file the Supabase CLI applies.
import schema0001 from '../../../supabase/migrations/0001_init.sql?raw';
import schema0002 from '../../../supabase/migrations/0002_content.sql?raw';
import schema0003 from '../../../supabase/migrations/0003_lists.sql?raw';
import schema0004 from '../../../supabase/migrations/0004_room_images.sql?raw';
import schema0005 from '../../../supabase/migrations/0005_bookings.sql?raw';

/**
 * Nothing connects and nothing throws when this module is imported: the build
 * imports every server module to analyse routes, long before any environment
 * exists. The client is created on the first query instead.
 *
 * Supabase's pooler on port 6543 runs pgbouncer in transaction mode, which
 * cannot hold prepared statements between queries — hence `prepare: false`.
 * A small pool is right here: this is one villa's website, and the pooler is
 * already doing the multiplexing.
 */
function connect(): Sql {
	if (!env.DATABASE_URL) {
		throw new Error(
			'DATABASE_URL is not set. Copy it from Supabase → Project Settings → Database → ' +
				'Connection string → URI, and use the port 6543 pooler.'
		);
	}

	return postgres(env.DATABASE_URL, {
		prepare: false,
		max: Number(env.DATABASE_POOL_MAX ?? 5),
		idle_timeout: 30,
		connect_timeout: 15,
		onnotice: () => {}
	});
}

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

/**
 * Applies the schema and seeds the rooms and gallery. Safe to run on every
 * boot: the DDL is `if not exists`, and the seeds are keyed on the natural
 * unique columns, so they fill an empty project and then do nothing.
 */
async function migrate(sql: Sql) {
	await sql.unsafe(schema0001);
	await sql.unsafe(schema0002);
	await sql.unsafe(schema0003);

	// postgres.js builds the multi-row VALUES list from these objects, so the
	// column list and the values cannot drift apart.
	const rooms = seedRooms.map((room, position) => ({
		slug: room.slug,
		name: room.name,
		summary: room.summary,
		rate_usd: room.rate,
		image: room.image,
		position
	}));

	await sql`
		INSERT INTO rooms ${sql(rooms, 'slug', 'name', 'summary', 'rate_usd', 'image', 'position')}
		ON CONFLICT (slug) DO NOTHING
	`;

	const gallery = seedGallery.map((image, position) => ({ ...image, position }));

	await sql`
		INSERT INTO gallery_images ${sql(gallery, 'src', 'alt', 'grouping', 'position')}
		ON CONFLICT (src) DO NOTHING
	`;

	// Runs last: it carries each room's photograph across, so the rooms must
	// already be there.
	await sql.unsafe(schema0004);
	await sql.unsafe(schema0005);

}

let client: Sql | null = null;
let ready: Promise<Sql> | null = null;

/**
 * Returns a client whose schema is applied and whose rooms are seeded. Every
 * query goes through here, so the migration cannot be skipped by accident.
 *
 * The work happens once and is then reused. A failure is not cached, so a
 * database that was briefly unreachable recovers without a restart.
 */
export function dbReady(): Promise<Sql> {
	if (!ready) {
		ready = (async () => {
			client ??= connect();
			await migrate(client);
			return client;
		})().catch((error) => {
			ready = null;
			throw error;
		});
	}
	return ready;
}
