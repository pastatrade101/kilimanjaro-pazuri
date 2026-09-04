<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import BookingCta from '$lib/components/BookingCta.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const content = $derived(data.content);
	const images = $derived(content.images);
	const amenities = $derived(content.amenities);
	const site = $derived(content.site);

	const heroStats = [
		{ label: 'Breakfast', value: 'Included' },
		{ label: 'WiFi', value: 'Complimentary' },
		{ label: 'Shared spaces', value: 'Garden & dining' }
	];
</script>

<Seo title="Amenities | {site.name} Moshi" description={amenities.intro} />

<PageHeader
	title="Amenities"
	crumb="Amenities"
	image={images.amenitiesHeader}
	lead={amenities.heroLead}
	stats={heroStats}
	statsLabel="Amenity highlights"
/>

<section class="kp-amenities-page section-space">
	<div class="kp-amenities-page__inner">
		<div class="kp-amenities-intro__grid">
			<div class="kp-amenities-intro__copy">
				<div class="sec-title text-start">
					<div class="sec-title__top justify-content-start">
						<span class="line-left"></span>
						<h6 class="sec-title__tagline">What the villa offers</h6>
					</div>
					<h2 class="sec-title__title kp-reveal">{amenities.introTitle}</h2>
				</div>
				<p class="kp-amenities-intro__lead wow fadeInUp" data-wow-duration="1200ms">
					{amenities.intro}
				</p>
			</div>

			<aside class="kp-amenities-note wow fadeInUp" data-wow-duration="1200ms">
				<span class="kp-amenities-note__icon" aria-hidden="true">
					<i class="icon-support"></i>
				</span>
				<div>
					<h2>{amenities.noteTitle}</h2>
					<p>{amenities.note}</p>
				</div>
			</aside>
		</div>

		<div class="kp-amenities-showcase">
			<header class="kp-amenities-showcase__head">
				<p class="kp-amenities-showcase__eyebrow">At a glance</p>
				<h2 class="kp-reveal">{amenities.title}</h2>
			</header>

			<div class="kp-amenities-features">
				{#each amenities.groups as group, i (group.title)}
					<article
						class="kp-amenity-feature wow fadeInUp"
						class:kp-amenity-feature--reversed={i % 2 === 1}
						class:kp-amenity-feature--included={group.title === 'Always included'}
						data-wow-duration="1200ms"
						id="amenity-group-{i + 1}"
					>
						<div class="kp-amenity-feature__media">
							<a href={group.image} class="img-popup" data-group="1" aria-label="Open photograph: {group.imageAlt}">
								<img src={group.image} alt={group.imageAlt} width="900" height="640" loading="lazy" />
							</a>
							<span class="kp-amenity-feature__number" aria-hidden="true">0{i + 1}</span>
						</div>

						<div class="kp-amenity-feature__content">
							<p class="kp-amenity-feature__kicker">{group.kicker}</p>
							<h2>{group.title}</h2>
							<p class="kp-amenity-feature__description">{group.description}</p>

							<ul class="kp-amenity-feature__list">
								{#each group.items as item (item.label)}
									<li>
										<span class="kp-amenity-feature__icon" aria-hidden="true">
											<i class={item.icon}></i>
										</span>
										<span>{item.label}</span>
									</li>
								{/each}
							</ul>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
</section>

<BookingCta />
