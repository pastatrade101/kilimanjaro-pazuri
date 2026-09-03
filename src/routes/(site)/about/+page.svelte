<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import BookingCta from '$lib/components/BookingCta.svelte';
	import { about, actions, site, home } from '$lib/content/site';

	const heroStats = [
		{ label: 'Setting', value: 'Private villa' },
		{ label: 'Location', value: 'Moshi, Tanzania' },
		{ label: 'Reception', value: '6 languages' }
	];
	const heroActions = [
		{ label: 'Explore our rooms', href: '/rooms' },
		{ label: actions.whatsapp.label, href: actions.whatsapp.href, external: true }
	];
</script>

<Seo title="About | {site.name} Moshi" description={about.paragraphs[0]} />

<PageHeader
	title={about.title}
	crumb="About"
	image="/assets/images/villa/dining.jpg"
	lead={about.heroLead}
	stats={heroStats}
	statsLabel="Villa highlights"
	actions={heroActions}
/>

<section class="kp-about-story section-space">
	<div class="container">
		<div class="kp-about-story__grid">
			<div class="kp-about-story__media wow fadeInLeft" data-wow-duration="1200ms">
				<figure class="kp-about-story__photo kp-about-story__photo--main hover:shine">
					<img
						src="/assets/images/villa/hero-garden-suite.jpg"
						alt="A spacious guest room at Kilimanjaro Pazuri"
						width="1200"
						height="900"
					/>
					<figcaption>A calm room to return to</figcaption>
				</figure>

				<figure class="kp-about-story__photo kp-about-story__photo--detail hover:shine">
					<img
						src="/assets/images/villa/kitchen.jpg"
						alt="The shared kitchen at Kilimanjaro Pazuri"
						width="900"
						height="640"
						loading="lazy"
					/>
				</figure>

				<div class="kp-about-story__media-note">
					<span>Rest</span>
					<span>Recharge</span>
					<span>Explore</span>
				</div>
			</div>

			<div class="kp-about-story__content">
				<div class="sec-title text-start">
					<div class="sec-title__top justify-content-start">
						<span class="line-left"></span>
						<h6 class="sec-title__tagline">Our villa</h6>
					</div>
					<h2 class="sec-title__title kp-reveal">{about.storyTitle}</h2>
				</div>

				{#each about.paragraphs.slice(0, 2) as paragraph, i (paragraph)}
					<p class="wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="{i * 100}ms">
						{paragraph}
					</p>
				{/each}

				<p class="kp-about-story__note wow fadeInUp" data-wow-duration="1200ms">
					{about.storyNote}
				</p>

				<div class="kp-about-story__actions wow fadeInUp" data-wow-duration="1200ms">
					<a href="/rooms" class="kp-btn kp-btn--outline">Find your room</a>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="kp-about-pillars section-space">
	<div class="container">
		<div class="kp-about-pillars__head">
			<div class="sec-title text-start">
				<div class="sec-title__top justify-content-start">
					<span class="line-left"></span>
					<h6 class="sec-title__tagline">The Pazuri experience</h6>
				</div>
				<h2 class="sec-title__title kp-reveal">{home.whyTitle}</h2>
			</div>
			<p>
				The simple things matter here: room to rest, an easy morning and thoughtful support
				when you need it.
			</p>
		</div>

		<div class="kp-about-pillars__grid">
			{#each home.why as reason, i (reason.title)}
				<article class="kp-about-pillar wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="{i * 80}ms">
					<span class="kp-about-pillar__number" aria-hidden="true">0{i + 1}</span>
					<i class={reason.icon} aria-hidden="true"></i>
					<h3>{reason.title}</h3>
					<p>{reason.text}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<section class="kp-about-welcome section-space-top" aria-labelledby="about-welcome-title">
	<div class="container">
		<div class="kp-about-welcome__grid">
			<div>
				<p class="kp-about-welcome__eyebrow">At reception</p>
				<h2 class="kp-reveal" id="about-welcome-title">{about.welcomeTitle}</h2>
				<p class="kp-about-welcome__lead">{about.paragraphs[2]}</p>
			</div>

			<ul class="kp-about-languages" aria-label="Languages spoken at reception">
				{#each about.languages as language, i (language)}
					<li class="wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="{i * 70}ms">
						<span aria-hidden="true">0{i + 1}</span>
						<strong>{language}</strong>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<BookingCta topSpacing />
