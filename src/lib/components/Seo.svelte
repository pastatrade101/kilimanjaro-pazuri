<script lang="ts">
	import { page } from '$app/state';

	let {
		title,
		description = undefined,
		image = '/assets/images/villa/hero-garden-suite.jpg'
	}: { title: string; description?: string; image?: string } = $props();

	const site = $derived(page.data.content.site);
	const text = $derived(description ?? site.defaultDescription);

	const url = $derived(page.url.href);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={text} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={text} />
	<meta property="og:image" content={image} />
	<meta property="og:url" content={url} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={text} />
	<meta name="twitter:image" content={image} />
</svelte:head>
