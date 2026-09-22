<script lang="ts">
	import { page } from '$app/state';

	const CARD = '/assets/images/villa/social-card.png';
	const CARD_PX = 400;

	let {
		title,
		description = undefined,
		image = CARD
	}: { title: string; description?: string; image?: string } = $props();

	const site = $derived(page.data.content.site);
	const text = $derived(description ?? site.defaultDescription);

	const url = $derived(page.url.href);

	// Scrapers do not resolve a relative og:image against the page, and the
	// ones that try disagree about how. They get an absolute URL.
	const imageUrl = $derived(new URL(image, page.url.origin).href);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={text} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={text} />
	<meta property="og:image" content={imageUrl} />
	{#if image === CARD}
		<meta property="og:image:width" content={String(CARD_PX)} />
		<meta property="og:image:height" content={String(CARD_PX)} />
	{/if}
	<meta property="og:image:alt" content={site.name} />
	<meta property="og:url" content={url} />

	<!--
		`summary`, not `summary_large_image`: a shared link should read as a line
		with the mark beside it, not a poster. The card is square for the same
		reason — a wide image is the other thing that makes a platform go big.
	-->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={text} />
	<meta name="twitter:image" content={imageUrl} />
	<meta name="twitter:image:alt" content={site.name} />
</svelte:head>
