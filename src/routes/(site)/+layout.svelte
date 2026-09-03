<script lang="ts">
	import { onMount } from 'svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteDrawer from '$lib/components/SiteDrawer.svelte';
	import StickyBook from '$lib/components/StickyBook.svelte';
	import { initShell } from '$lib/theme/anim';

	let { children } = $props();

	// The chrome these behaviours attach to lives here, not in the root
	// layout — starting them there broke on any route outside this group.
	onMount(() => {
		initShell();
		releaseForeignServiceWorkers();
	});

	/**
	 * This site ships no service worker. Another app served from the same
	 * localhost origin can leave one registered, and it then answers our
	 * requests — which is how a different project's "You're offline" screen
	 * appeared over this site. Anything registered here is not ours.
	 */
	async function releaseForeignServiceWorkers() {
		if (!('serviceWorker' in navigator)) return;
		try {
			const registrations = await navigator.serviceWorker.getRegistrations();
			if (registrations.length === 0) return;
			await Promise.all(registrations.map((r) => r.unregister()));
			if ('caches' in window) {
				const keys = await caches.keys();
				await Promise.all(keys.map((key) => caches.delete(key)));
			}
		} catch {
			// A browser that refuses the query has nothing to clear.
		}
	}
</script>

<a class="kp-skip" href="#main">Skip to content</a>

<div class="custom-cursor__cursor" aria-hidden="true"></div>
<div class="custom-cursor__cursor-two" aria-hidden="true"></div>

<div class="page-wrapper">
	<SiteHeader />

	<main id="main">
		{@render children()}
	</main>

	<SiteFooter />
</div>

<SiteDrawer />
<StickyBook />

<button id="scroll-top" class="scroll-top" type="button" aria-label="Back to top">
	<span id="scroll-top-value" class="scroll-top-value"></span>
</button>
