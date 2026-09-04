/**
 * Addressing every editable field by its path through the content file.
 *
 * `flatten` walks the deck's copy and yields one entry per string it finds —
 * 'home.heroTitle', 'about.paragraphs.1', 'location.distances.0.name'. That
 * means the editable surface is derived from the copy itself: a paragraph
 * added to site.ts is editable the moment it is written, with no list to keep
 * in step.
 */

export type FieldKind = 'text' | 'long' | 'image' | 'email' | 'tel';

export type Field = {
	key: string;
	value: string;
	kind: FieldKind;
	/** A human label derived from the last meaningful part of the path. */
	label: string;
};

const IMAGE_HINT = /(image|photo|src|logo|favicon)$/i;
const LONG_HINT = /(text|intro|note|body|description|paragraph|lead|guidance|summary|one|two|three)$/i;

/** Fields the site computes or that must not be typed over. */
const SKIP = new Set(['site.year', 'site.internalAddressNote']);

function kindFor(key: string, value: string): FieldKind {
	const last = key.split('.').pop() ?? '';
	if (IMAGE_HINT.test(last) || value.startsWith('/assets/') || value.startsWith('/media/')) {
		return 'image';
	}
	if (/email/i.test(last)) return 'email';
	if (/phoneHref|whatsapp$/i.test(last)) return 'tel';
	if (LONG_HINT.test(last) || value.length > 110 || value.includes('\n')) return 'long';
	return 'text';
}

/** "heroTitle" -> "Hero title"; "paragraphs.1" -> "Paragraph 2". */
export function labelFor(key: string): string {
	const parts = key.split('.');
	const last = parts[parts.length - 1];

	if (/^\d+$/.test(last)) {
		const parent = parts[parts.length - 2] ?? 'Item';
		const singular = parent.replace(/s$/, '');
		return `${humanise(singular)} ${Number(last) + 1}`;
	}

	const index = parts.findLast((part) => /^\d+$/.test(part));
	const human = humanise(last);
	return index === undefined ? human : `${human} ${Number(index) + 1}`;
}

function humanise(word: string): string {
	const spaced = word.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
	return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** Every string reachable in `source`, addressed by its path. */
export function flatten(source: unknown, prefix = ''): Field[] {
	const out: Field[] = [];

	const walk = (node: unknown, path: string) => {
		if (typeof node === 'string') {
			if (SKIP.has(path)) return;
			out.push({ key: path, value: node, kind: kindFor(path, node), label: labelFor(path) });
			return;
		}
		if (Array.isArray(node)) {
			node.forEach((item, i) => walk(item, path ? `${path}.${i}` : String(i)));
			return;
		}
		if (node && typeof node === 'object') {
			for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
		}
		// Numbers, booleans and functions are computed, not copy.
	};

	walk(source, prefix);
	return out;
}

/** Applies `key -> value` overrides onto a deep clone of the defaults. */
export function applyOverrides<T>(defaults: T, overrides: Map<string, string>): T {
	const clone = structuredClone(defaults);

	for (const [key, value] of overrides) {
		const parts = key.split('.');
		let node: Record<string, unknown> | unknown[] = clone as never;

		for (let i = 0; i < parts.length - 1; i++) {
			const step: unknown = Array.isArray(node)
				? (node as unknown[])[Number(parts[i])]
				: (node as Record<string, unknown>)[parts[i]];
			if (step === null || typeof step !== 'object') {
				node = null as never;
				break;
			}
			node = step as Record<string, unknown> | unknown[];
		}

		if (!node) continue;

		const last = parts[parts.length - 1];
		// Only replace something that was already a string: a stale key from an
		// older version of the copy must not graft new shapes onto it.
		if (Array.isArray(node)) {
			const i = Number(last);
			if (typeof node[i] === 'string') node[i] = value;
		} else if (typeof (node as Record<string, unknown>)[last] === 'string') {
			(node as Record<string, unknown>)[last] = value;
		}
	}

	return clone;
}
