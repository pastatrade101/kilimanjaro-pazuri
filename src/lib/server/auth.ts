import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { db } from './db';

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

export function createSession(username: string, cookies: Cookies) {
	const id = randomBytes(32).toString('hex');
	const expiresAt = Date.now() + SESSION_TTL_MS;
	db.prepare('INSERT INTO sessions (id, username, expires_at) VALUES (?, ?, ?)').run(
		id,
		username,
		expiresAt
	);
	cookies.set(SESSION_COOKIE, id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: SESSION_TTL_MS / 1000
	});
}

export function readSession(cookies: Cookies): { username: string } | null {
	const id = cookies.get(SESSION_COOKIE);
	if (!id) return null;

	const row = db.prepare('SELECT username, expires_at FROM sessions WHERE id = ?').get(id) as
		| { username: string; expires_at: number }
		| undefined;

	if (!row) return null;
	if (Date.now() > row.expires_at) {
		db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
		return null;
	}
	return { username: row.username };
}

export function destroySession(cookies: Cookies) {
	const id = cookies.get(SESSION_COOKIE);
	if (id) db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

/** Clears sessions that have already expired. */
export function pruneSessions() {
	db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
}
