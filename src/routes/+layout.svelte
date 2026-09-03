<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { initPage, closeOverlays } from '$lib/theme/anim';

	let { children } = $props();

	beforeNavigate(() => {
		closeOverlays();
	});

	// Re-run the reveals for the markup each navigation renders — a full page
	// load never happens here.
	afterNavigate(() => {
		initPage();
	});
</script>

{@render children()}
