/**
 * A small in-memory limiter for the public forms. Enough for a single-villa
 * site on one node; swap for a shared store if the site is ever scaled out.
 *
 * Behind a reverse proxy, adapter-node reports the proxy's own address for
 * every visitor unless ADDRESS_HEADER is set (see the README), which would
 * put the whole internet in one bucket.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || now > bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, remaining: limit - 1 };
	}

	bucket.count += 1;
	if (bucket.count > limit) {
		return { allowed: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
	}
	return { allowed: true, remaining: limit - bucket.count };
}

/** Keeps the map from growing without bound on a long-running server. */
setInterval(() => {
	const now = Date.now();
	for (const [key, bucket] of buckets) {
		if (now > bucket.resetAt) buckets.delete(key);
	}
}, 60 * 1000).unref?.();

/**
 * Every route that accepts an enquiry shares one bucket per address, so five
 * submissions means five — not five per endpoint.
 */
export function limitEnquiries(address: string) {
	return rateLimit(`enquiry:${address}`);
}
