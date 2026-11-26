import { dbReady } from './db';

/**
 * Restarts the process when the database stops answering.
 *
 * The container's HEALTHCHECK already notices this — it reported `unhealthy`
 * for four days straight — but Docker does not restart an unhealthy container,
 * so nothing ever acted on it. Twice now the pool has wedged after days of
 * uptime while Supabase itself was perfectly reachable from elsewhere, and the
 * site stayed down until someone noticed and restarted it by hand.
 *
 * Exiting hands the problem to `restart: unless-stopped`, which fixes it in
 * seconds. Three consecutive failures are required, so a single slow probe or
 * a brief blip is ignored; that makes the worst case about a minute and a half
 * of downtime instead of days.
 */

const PROBE_EVERY_MS = 30_000;
const PROBE_TIMEOUT_MS = 10_000;
const STRIKES_BEFORE_EXIT = 3;

let strikes = 0;
let started = false;
let probing = false;

/**
 * A probe must fail on its own clock: a wedged pool never answers at all, and
 * neither does dbReady() while it waits for a connection out of one. Both go
 * inside the race, or the probe hangs in exactly the case it exists to catch.
 */
async function probe(): Promise<void> {
	let timer: ReturnType<typeof setTimeout>;
	await Promise.race([
		(async () => {
			const sql = await dbReady();
			await sql`SELECT 1`;
		})(),
		new Promise<never>((_, reject) => {
			timer = setTimeout(
				() => reject(new Error(`no answer in ${PROBE_TIMEOUT_MS}ms`)),
				PROBE_TIMEOUT_MS
			);
		})
	]).finally(() => clearTimeout(timer!));
}

export function startWatchdog(): void {
	if (started) return;
	started = true;

	const timer = setInterval(async () => {
		// The timeout bounds each probe, but a tick that arrives while one is
		// still settling must not stack a second on top of it.
		if (probing) return;
		probing = true;
		try {
			await probe();
			if (strikes > 0) {
				console.info(`[watchdog] database answered again after ${strikes} failed probe(s)`);
				strikes = 0;
			}
		} catch (error) {
			strikes += 1;
			console.warn(
				`[watchdog] probe ${strikes}/${STRIKES_BEFORE_EXIT} failed: ${(error as Error).message}`
			);
			if (strikes >= STRIKES_BEFORE_EXIT) {
				console.error('[watchdog] database unreachable — exiting so the container restarts');
				process.exit(1);
			}
		} finally {
			probing = false;
		}
	}, PROBE_EVERY_MS);

	// Never let the probe hold up a shutdown.
	timer.unref?.();
}
