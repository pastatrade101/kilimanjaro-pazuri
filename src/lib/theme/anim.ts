import { browser } from '$app/environment';
import { tick } from 'svelte';

/**
 * `initShell` runs once with the site chrome; `initPage` runs after every
 * navigation, once Svelte has flushed the new markup to the DOM.
 */
export function initShell() {
	if (!browser) return;
	window.KPTheme?.initShell();
}

/** The lightbox lives on <body>, outside Svelte's tree; shut it before leaving. */
export function closeOverlays() {
	if (!browser) return;
	window.KPTheme?.closeOverlays();
}

export async function initPage() {
	if (!browser) return;
	await tick();

	// One frame, so images and layout settle first. A tab loaded in the
	// background never gets that frame, so a timer backs it up.
	let done = false;
	const run = () => {
		if (done) return;
		done = true;
		window.KPTheme?.initPage();
	};

	requestAnimationFrame(run);
	setTimeout(run, 250);
}
