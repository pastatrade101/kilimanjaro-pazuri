import { randomBytes } from 'node:crypto';
import { dbReady } from './db';

/** Formats a browser will render and a phone camera will produce. */
const ALLOWED = new Map([
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
	['image/webp', 'webp'],
	['image/avif', 'avif'],
	['image/gif', 'gif'],
	['image/svg+xml', 'svg']
]);

export const MAX_BYTES = 6 * 1024 * 1024;

export type StoredMedia = {
	id: string;
	filename: string;
	content_type: string;
	byte_size: number;
	created_at: string;
};

export class MediaError extends Error {}

/**
 * Stores an uploaded photograph and returns the path to serve it from.
 * Images live in Postgres so the server keeps no state of its own; there are
 * only ever a few dozen, and they are served with a long cache lifetime.
 */
export async function storeUpload(file: File): Promise<string> {
	const extension = ALLOWED.get(file.type);
	if (!extension) {
		throw new MediaError('That file type is not a photograph the site can show.');
	}
	if (file.size === 0) throw new MediaError('That file was empty.');
	if (file.size > MAX_BYTES) {
		throw new MediaError(`Photographs must be under ${Math.round(MAX_BYTES / 1024 / 1024)} MB.`);
	}

	const id = `${randomBytes(8).toString('hex')}.${extension}`;
	const bytes = Buffer.from(await file.arrayBuffer());

	const sql = await dbReady();
	await sql`
		INSERT INTO media (id, filename, content_type, bytes, byte_size)
		VALUES (${id}, ${file.name || id}, ${file.type}, ${bytes}, ${bytes.length})
	`;

	return `/media/${id}`;
}

export async function readMedia(id: string) {
	const sql = await dbReady();
	const [row] = await sql<{ content_type: string; bytes: Buffer }[]>`
		SELECT content_type, bytes FROM media WHERE id = ${id}
	`;
	return row;
}

export async function listMedia(): Promise<StoredMedia[]> {
	const sql = await dbReady();
	const rows = await sql`
		SELECT id, filename, content_type, byte_size, created_at
		  FROM media ORDER BY created_at DESC
	`;
	return rows as unknown as StoredMedia[];
}
