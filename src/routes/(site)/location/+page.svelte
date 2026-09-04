<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import BookingCta from '$lib/components/BookingCta.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const content = $derived(data.content);
	const images = $derived(content.images);
	const actions = $derived(content.actions);
	const location = $derived(content.location);
	const site = $derived(content.site);
	const seo = $derived(content.seo);

	// Editable in the admin area, so the exact pin can replace the town once
	// the street address is confirmed — item 1 on the pre-launch checklist.
	const mapQuery = $derived(encodeURIComponent(location.mapQuery));
	const mapSrc = $derived(`https://www.google.com/maps?q=${mapQuery}&output=embed`);
	const directions = $derived(
		`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`
	);
	const heroStats = $derived([
		{ label: 'Your base', value: site.location },
		...location.distances.slice(0, 2).map((d) => ({ label: d.name, value: d.distance }))
	]);
	const heroActions = $derived([
		{ label: location.mapCta, href: directions, external: true },
		{ label: 'Ask for the arrival pin', href: actions.whatsapp.href, external: true }
	]);
</script>

<Seo title={seo.location.title} description={seo.location.description} />

<PageHeader
	title={location.title}
	crumb="Location"
	image={images.locationHeader}
	lead={location.heroLead}
	stats={heroStats}
	statsLabel="Location highlights"
	actions={heroActions}
/>

<section class="kp-location-overview section-space">
	<div class="container">
		<div class="kp-location-overview__head">
			<div class="sec-title text-start">
				<div class="sec-title__top justify-content-start">
					<span class="line-left"></span>
					<h6 class="sec-title__tagline">Where we are</h6>
				</div>
				<h2 class="sec-title__title kp-reveal">A calm Moshi base</h2>
			</div>
			<p class="wow fadeInUp" data-wow-duration="1200ms">{location.intro}</p>
		</div>

		<div class="kp-location-map-shell">
			<div class="kp-map kp-location-map wow fadeInLeft" data-wow-duration="1200ms">
				<iframe
					title="Map of Moshi in the Kilimanjaro Region"
					src={mapSrc}
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					allowfullscreen
				></iframe>
			</div>

			<aside class="kp-location-arrival wow fadeInRight" data-wow-duration="1200ms">
				<p class="kp-location-arrival__eyebrow">Arrival planning</p>
				<h2>{location.mapTitle}</h2>
				<p>{location.mapNote}</p>

				<dl class="kp-location-arrival__details">
					<div>
						<dt>Area</dt>
						<dd>{site.location}</dd>
					</div>
					<div>
						<dt>Exact pin</dt>
						<dd>Confirm directly before arrival</dd>
					</div>
				</dl>

				<div class="kp-location-arrival__actions">
					<a href={directions} class="kp-btn kp-btn--primary" target="_blank" rel="noopener">
						{location.mapCta}<i class="icon-pin" aria-hidden="true"></i>
					</a>
					<a href={actions.whatsapp.href} class="kp-btn kp-btn--outline" target="_blank" rel="noopener">
						Ask on WhatsApp
					</a>
				</div>

				<a class="kp-location-arrival__phone" href={actions.call.href}>
					<span>Prefer to call?</span>
					<strong>{site.phone}</strong>
				</a>
			</aside>
		</div>
	</div>
</section>

<section class="kp-location-distances section-space-top" aria-labelledby="location-distances-title">
	<div class="container">
		<header class="kp-location-distances__head">
			<p class="kp-location-distances__eyebrow">Approximate road distances</p>
			<h2 class="kp-reveal" id="location-distances-title">{location.distancesTitle}</h2>
			<p>{location.distancesIntro}</p>
		</header>

		<div class="kp-location-distances__grid">
			{#each location.distances as item, i (item.name)}
				<article class="kp-location-distance wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="{i * 90}ms">
					<div class="kp-location-distance__top">
						<i class={item.icon} aria-hidden="true"></i>
						<span aria-hidden="true">0{i + 1}</span>
					</div>
					<h3>{item.name}</h3>
					<strong>{item.distance}</strong>
					<p>{item.context}</p>
				</article>
			{/each}
		</div>

		<p class="kp-location-distances__note">
			<i class="icon-support" aria-hidden="true"></i>
			Distances are approximate and can vary by route. Contact us when planning your transfer.
		</p>
	</div>
</section>

<BookingCta topSpacing />
