<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import RoomCard from '$lib/components/RoomCard.svelte';
	import BookingCta from '$lib/components/BookingCta.svelte';
	import HeroSlider from '$lib/components/HeroSlider.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const content = $derived(data.content);
	const images = $derived(content.images);
	const site = $derived(content.site);
	const home = $derived(content.home);
	const actions = $derived(content.actions);
	const amenities = $derived(content.amenities);
	const seo = $derived(content.seo);

	const heroSlides = $derived([
		{
			src: images.homeHeroOne,
			alt: 'The garden suite at Kilimanjaro Pazuri',
			caption: 'The garden suite'
		},
		{
			src: images.homeHeroTwo,
			alt: 'The Zanzibar Room',
			caption: 'The Zanzibar Room'
		},
		{
			src: images.homeHeroThree,
			alt: 'The dining room at Kilimanjaro Pazuri',
			caption: 'The dining room'
		},
		{
			src: images.homeHeroFour,
			alt: 'Seating in the villa',
			caption: 'A quiet corner of the villa'
		}
	]);


</script>

<Seo title={seo.home.title} description={seo.home.description} />

<!-- Hero. Full-bleed photographs of the villa, the headline over them, two buttons. -->
<section class="kp-hero">
	<div class="kp-hero__media">
		<HeroSlider slides={heroSlides} />
	</div>

	<div class="kp-hero__inner">
		<p class="kp-hero__eyebrow">{site.descriptor}</p>
		<h1 class="kp-hero__title">{home.heroTitle}</h1>
		<p class="kp-hero__text">{home.heroText}</p>

		<div class="kp-hero__actions">
			<a href={actions.rooms.href} class="kp-btn kp-btn--primary">{actions.rooms.label}</a>
			<a
				href={actions.whatsapp.href}
				class="kp-btn kp-btn--ghost"
				target="_blank"
				rel="noopener"
			>
				{actions.whatsapp.label}
			</a>
		</div>
	</div>
</section>

<!-- Welcome. Two short paragraphs; they carry the whole promise of the place. -->
<section class="kp-intro" id="about">
	<div class="kp-intro__inner">
		<figure class="kp-intro__media wow fadeInLeft" data-wow-duration="1200ms">
			<img src={images.homeWelcome} alt="A room at Kilimanjaro Pazuri" loading="lazy" />
			<figcaption>The Tarangire Room</figcaption>
		</figure>

		<div class="kp-intro__content">
			<div class="sec-title text-start">
				<div class="sec-title__top justify-content-start">
					<span class="line-left"></span>
					<h6 class="sec-title__tagline">{home.welcomeTagline}</h6>
				</div>
				<h2 class="sec-title__title kp-reveal">{home.welcomeTitle}</h2>
			</div>

			<p class="kp-intro__lead wow fadeInUp" data-wow-duration="1200ms">{home.welcomeOne}</p>
			<p class="wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="100ms">{home.welcomeTwo}</p>

			<div class="kp-intro__actions wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="200ms">
				<a href="/about" class="kp-btn kp-btn--outline">About the villa</a>
			</div>
		</div>
	</div>
</section>

<!-- Six short reasons, set as two quiet columns — not cards. -->
<section class="section-space-bottom">
	<div class="container">
		<div class="sec-title text-center">
			<div class="sec-title__top justify-content-center">
				<span class="line-left"></span>
				<h6 class="sec-title__tagline">What the villa offers</h6>
				<span class="line-right"></span>
			</div>
			<h3 class="sec-title__title kp-reveal">{home.whyTitle}</h3>
		</div>

		<div class="kp-reasons">
			{#each home.why as reason, i (reason.title)}
				<div class="kp-reason wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="{i * 100}ms">
					<span class="kp-reason__icon"><i class={reason.icon}></i></span>
					<div>
						<h4 class="kp-reason__title">{reason.title}</h4>
						<p class="kp-reason__text">{reason.text}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Rooms. Closes with the rooms invitation and the "Explore our rooms" button. -->
<section class="apartment-one section-space-top">
	<div class="container">
		<div class="sec-title text-center">
			<div class="sec-title__top justify-content-center">
				<span class="line-left"></span>
				<h6 class="sec-title__tagline">Our rooms</h6>
				<span class="line-right"></span>
			</div>
			<h3 class="sec-title__title kp-reveal">{home.roomsTitle}</h3>
		</div>

		<p class="text-center wow fadeInUp" data-wow-duration="1500ms">{home.roomsText}</p>

		<div class="row gutter-y-30 mt-5">
			{#each data.rooms as room, i (room.slug)}
				<div class="col-lg-4 col-md-6">
					<RoomCard {room} delay={200 + i * 100} />
				</div>
			{/each}
		</div>

		<div class="text-center mt-5">
			<a href="/rooms" class="zoomvilla-btn">
				{home.roomsCta}<i class="icon-angle-small-right"></i>
			</a>
		</div>
	</div>
</section>

<!-- Amenities, in brief. The full list lives on its own page. -->
<section class="section-space">
	<div class="container">
		<div class="sec-title text-center">
			<div class="sec-title__top justify-content-center">
				<span class="line-left"></span>
				<h6 class="sec-title__tagline">Amenities</h6>
				<span class="line-right"></span>
			</div>
			<h3 class="sec-title__title kp-reveal">{amenities.title}</h3>
		</div>

		<div class="row gutter-y-30">
			{#each amenities.groups as group, i (group.title)}
				<div class="col-lg-4 wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="{i * 150}ms">
					<div class="kp-amenity-group">
						<h4 class="kp-amenity-group__title">{group.title}</h4>
						<ul class="kp-amenity-list">
							{#each group.items as item (item.label)}
								<li><i class={item.icon}></i><span>{item.label}</span></li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>

		<div class="text-center">
			<a href="/amenities" class="zoomvilla-btn">
				All amenities<i class="icon-angle-small-right"></i>
			</a>
		</div>
	</div>
</section>

<BookingCta />
