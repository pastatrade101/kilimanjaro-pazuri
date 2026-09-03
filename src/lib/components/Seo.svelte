<script lang="ts">
	import { page } from '$app/state';
	import { site } from '$lib/content/site';

	let {
		title,
		description = site.defaultDescription,
		image = '/assets/images/villa/hero-garden-suite.jpg'
	}: { title: string; description?: string; image?: string } = $props();

	const url = $derived(page.url.href);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:url" content={url} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
</svelte:head>
