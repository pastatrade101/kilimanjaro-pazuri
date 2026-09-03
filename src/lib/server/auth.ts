import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { dbReady } from './db';

export const SESSION_COOKIE = 'kp_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/** Creates a `scrypt` hash in the `salt:hash` form used by ADMIN_PASSWORD_HASH. */
export function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const derived = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
	const [salt, hash] = stored.split(':');
	if (!salt || !hash) return false;
	try {
		const derived = scryptSync(password, salt, 64);
		const expected = Buffer.from(hash, 'hex');
		if (derived.length !== expected.length) return false;
		return timingSafeEqual(derived, expected);
	} catch {
		// A malformed ADMIN_PASSWORD_HASH is a failed login, not a crash.
		return false;
	}
}

export function checkCredentials(username: string, password: string): boolean {
	const expectedUser = env.ADMIN_USERNAME;
	const expectedHash = env.ADMIN_PASSWORD_HASH;
	if (!expectedUser || !expectedHash) return false;

	// Compare both, always, so a wrong username costs the same as a wrong
	// password. timingSafeEqual throws when the buffers differ in length, and
	// JS string length is not UTF-8 byte length — a multi-byte username used
	// to crash the request with a 500 instead of failing the login.
	const given = Buffer.from(username, 'utf8');
	const expected = Buffer.from(expectedUser, 'utf8');
	const userOk = given.length === expected.length && timingSafeEqual(given, expected);
	const passOk = verifyPassword(password, expectedHash);
	return userOk && passOk;
}

export async function createSession(username: string, cookies: Cookies) {
	const sql = await dbReady();
	const id = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
	await sql`
		INSERT INTO sessions (id, username, expires_at)
		VALUES (${id}, ${username}, ${expiresAt})
	`;
	cookies.set(SESSION_COOKIE, id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: SESSION_TTL_MS / 1000
	});
}

export async function readSession(cookies: Cookies): Promise<{ username: string } | null> {
	const id = cookies.get(SESSION_COOKIE);
	if (!id) return null;

	const sql = await dbReady();
	const [row] = await sql<{ username: string; expires_at: Date }[]>`
		SELECT username, expires_at FROM sessions WHERE id = ${id}
	`;

	if (!row) return null;
	if (Date.now() > row.expires_at.getTime()) {
		await sql`DELETE FROM sessions WHERE id = ${id}`;
		return null;
	}
	return { username: row.username };
}

export async function destroySession(cookies: Cookies) {
	const id = cookies.get(SESSION_COOKIE);
	if (id) {
		const sql = await dbReady();
		await sql`DELETE FROM sessions WHERE id = ${id}`;
	}
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

/** Clears sessions that have already expired. */
export async function pruneSessions() {
	const sql = await dbReady();
	await sql`DELETE FROM sessions WHERE expires_at < now()`;
}
