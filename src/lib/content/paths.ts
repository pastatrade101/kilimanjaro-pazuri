/**
 * Addressing every editable field by its path through the content file.
 *
 * `flatten` walks the deck's copy and yields one entry per string it finds —
 * 'home.heroTitle', 'about.paragraphs.1', 'location.distances.0.name'. That
 * means the editable surface is derived from the copy itself: a paragraph
 * added to site.ts is editable the moment it is written, with no list to keep
 * in step.
 */

export type FieldKind = 'text' | 'long' | 'image' | 'email' | 'tel' | 'icon';

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
	if (last === 'icon' || value.startsWith('icon-')) return 'icon';
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

export type ListShape = {
	/** Path through the copy, e.g. 'home.why' or 'amenities.groups.0.items'. */
	path: string;
	/** 'strings' for a plain list; otherwise the string fields each item has. */
	fields: string[] | null;
	count: number;
	label: string;
};

/**
 * Every array in the copy that the owner could sensibly grow or shrink.
 *
 * Arrays of plain strings, and arrays of objects whose own values are strings.
 * An object that itself contains an array is skipped here and its inner array
 * is reported on its own path, so each list is edited where it lives.
 */
export function listPaths(source: unknown, prefix = ''): ListShape[] {
	const out: ListShape[] = [];

	const walk = (node: unknown, path: string) => {
		if (Array.isArray(node)) {
			if (node.length > 0 && node.every((item) => typeof item === 'string')) {
				out.push({ path, fields: null, count: node.length, label: labelFor(path) });
				return;
			}

			const objects = node.filter(
				(item) => item && typeof item === 'object' && !Array.isArray(item)
			) as Record<string, unknown>[];

			if (objects.length === node.length && objects.length > 0) {
				const fields = Object.keys(objects[0]).filter(
					(key) => typeof objects[0][key] === 'string'
				);
				if (fields.length > 0) {
					out.push({ path, fields, count: node.length, label: labelFor(path) });
				}
				// Anything nested inside an item is a list in its own right.
				objects.forEach((item, i) => walk(item, `${path}.${i}`));
				return;
			}

			node.forEach((item, i) => walk(item, `${path}.${i}`));
			return;
		}

		if (node && typeof node === 'object') {
			for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
		}
	};

	walk(source, prefix);
	return out;
}

/** Reads the array a path points at, or undefined if there is none. */
export function readPath(source: unknown, path: string): unknown {
	let node: unknown = source;
	for (const part of path.split('.')) {
		if (node === null || typeof node !== 'object') return undefined;
		node = Array.isArray(node)
			? (node as unknown[])[Number(part)]
			: (node as Record<string, unknown>)[part];
	}
	return node;
}

/** Replaces the array a path points at. */
export function writePath(target: unknown, path: string, value: unknown): boolean {
	const parts = path.split('.');
	let node: unknown = target;

	for (let i = 0; i < parts.length - 1; i++) {
		if (node === null || typeof node !== 'object') return false;
		node = Array.isArray(node)
			? (node as unknown[])[Number(parts[i])]
			: (node as Record<string, unknown>)[parts[i]];
	}

	if (node === null || typeof node !== 'object') return false;
	const last = parts[parts.length - 1];

	if (Array.isArray(node)) {
		const i = Number(last);
		if (!Number.isInteger(i)) return false;
		(node as unknown[])[i] = value;
	} else {
		(node as Record<string, unknown>)[last] = value;
	}
	return true;
}
