<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import BookingCta from '$lib/components/BookingCta.svelte';
	import { actions, gallery, site } from '$lib/content/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const imageCount = $derived(
		data.groups.reduce((total, group) => total + group.images.length, 0)
	);
	const heroStats = $derived([
		{ label: 'Collections', value: `${data.groups.length} stories` },
		{ label: 'Photography', value: `${imageCount} images` },
		{ label: 'Larger view', value: 'Select any image' }
	]);
	const heroActions = [
		{ label: 'Explore the gallery', href: '#gallery-collections' },
		{ label: actions.rooms.label, href: actions.rooms.href }
	];

	function groupId(name: string) {
		return `gallery-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
	}

	function tileSize(index: number, total: number) {
		if (index === 0) return 'featured';
		if (index === 1) return 'wide';
		if (total === 5 && index === 4) return 'full';
		if (total === 6 && index >= 4) return 'wide';
		if (total === 7 && index === 6) return 'wide';
		return 'standard';
	}
</script>

<Seo title="Gallery | {site.name} Moshi" description={gallery.intro} />

<PageHeader
	title="Inside Kilimanjaro Pazuri"
	crumb="Gallery"
	image="/assets/images/villa/room-5.jpg"
	lead={gallery.heroLead}
	stats={heroStats}
	statsLabel="Gallery highlights"
	actions={heroActions}
/>

<section class="kp-gallery-page section-space-top" id="gallery-collections">
	<div class="container">
		<div class="kp-gallery-intro">
			<div class="sec-title text-start">
				<div class="sec-title__top justify-content-start">
					<span class="line-left"></span>
					<h6 class="sec-title__tagline">Photography</h6>
				</div>
				<h2 class="sec-title__title kp-reveal">{gallery.title}</h2>
			</div>

			<div class="kp-gallery-intro__copy wow fadeInUp" data-wow-duration="1200ms">
				<p>{gallery.intro}</p>
				<span><i class="icon-zoom-in" aria-hidden="true"></i>{gallery.hint}</span>
			</div>
		</div>

		<nav class="kp-gallery-index" aria-label="Browse gallery collections">
			<p>Browse collections</p>
			<div>
				{#each data.groups as group, i (group.grouping)}
					<a href="#{groupId(group.grouping)}">
						<span aria-hidden="true">0{i + 1}</span>
						<strong>{group.grouping}</strong>
						<small>{group.images.length} photographs</small>
					</a>
				{/each}
			</div>
		</nav>

		{#each data.groups as group, groupIndex (group.grouping)}
			<section
				class="kp-gallery-collection"
				id={groupId(group.grouping)}
				aria-labelledby="gallery-heading-{groupIndex + 1}"
			>
				<header class="kp-gallery-collection__head wow fadeInUp" data-wow-duration="1200ms">
					<div>
						<span aria-hidden="true">0{groupIndex + 1}</span>
						<h2 id="gallery-heading-{groupIndex + 1}">{group.grouping}</h2>
					</div>
					<p>{group.images.length} photographs</p>
				</header>

				<div class="kp-gallery-mosaic">
					{#each group.images as image, i (image.src)}
						<a
							href={image.src}
							class="img-popup kp-gallery-tile kp-gallery-tile--{tileSize(i, group.images.length)} wow fadeInUp"
							data-group={groupIndex + 1}
							data-wow-duration="1200ms"
							data-wow-delay="{i * 60}ms"
							aria-label="Open photograph: {image.alt}"
						>
							<img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
							<span class="kp-gallery-tile__meta">
								<small>{group.grouping}</small>
								<strong>{image.alt}</strong>
							</span>
							<span class="kp-gallery-tile__open" aria-hidden="true">
								<i class="icon-zoom-in"></i>
							</span>
						</a>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</section>

<BookingCta topSpacing />
