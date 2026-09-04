<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import RoomCard from '$lib/components/RoomCard.svelte';
	import BookingCta from '$lib/components/BookingCta.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const content = $derived(data.content);
	const images = $derived(content.images);
	const copy = $derived(content.rooms);
	const seo = $derived(content.seo);
	const actions = $derived(content.actions);

	const lowestRate = $derived(
		data.rooms.length > 0 ? Math.min(...data.rooms.map((room) => room.rate_usd)) : 0
	);
	const highestRate = $derived(
		data.rooms.length > 0 ? Math.max(...data.rooms.map((room) => room.rate_usd)) : 0
	);
	const rateRange = $derived(
		data.rooms.length > 0 ? `$${lowestRate}–$${highestRate} USD` : 'Enquire for rates'
	);
	const heroStats = $derived([
		{ label: 'Room collection', value: `${data.rooms.length} rooms` },
		{ label: 'Nightly range', value: rateRange },
		{ label: 'With every stay', value: 'Breakfast included' }
	]);
	const heroActions = [
		{ label: 'Explore the rooms', href: '#room-collection' },
		{ label: actions.whatsapp.label, href: actions.whatsapp.href, external: true }
	];
</script>

<Seo title={seo.rooms.title} description={seo.rooms.description} />

<PageHeader
	title="Rooms & Rates"
	crumb="Rooms & Rates"
	image={images.roomsHeader}
	lead={copy.heroLead}
	stats={heroStats}
	statsLabel="Room and rate highlights"
	actions={heroActions}
/>

<section class="kp-rooms-collection section-space" id="room-collection">
	<div class="container">
		<div class="kp-rooms-collection__intro">
			<div class="sec-title text-start">
				<div class="sec-title__top justify-content-start">
					<span class="line-left"></span>
					<h6 class="sec-title__tagline">Choose your room</h6>
				</div>
				<h2 class="sec-title__title kp-reveal">{copy.title}</h2>
			</div>

			<div class="kp-rooms-collection__copy wow fadeInUp" data-wow-duration="1200ms">
				<p>{copy.intro}</p>
				<ul class="kp-rooms-inclusions" aria-label="Included with every room">
					{#each copy.included as item (item)}
						<li><i class="icon-check-star" aria-hidden="true"></i>{item}</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="row gutter-y-30 kp-rooms-grid">
			{#each data.rooms as room, i (room.slug)}
				<div class="col-lg-4 col-md-6">
					<RoomCard {room} delay={100 + i * 80} />
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="kp-rate-guide section-space-top" aria-labelledby="rate-guide-title">
	<div class="container">
		<div class="kp-rate-guide__grid">
			<div class="kp-rate-guide__intro">
				<p class="kp-rate-guide__eyebrow">Rate guide</p>
				<h2 class="kp-reveal" id="rate-guide-title">{copy.ratesTitle}</h2>
				<p>{copy.ratesIntro}</p>

				<div class="kp-rate-guide__assurance wow fadeInUp" data-wow-duration="1200ms">
					<i class="icon-check-star" aria-hidden="true"></i>
					<p>
						<strong>One clear nightly price</strong>
						<span>Per room, not per guest. Ask us directly to confirm dates.</span>
					</p>
				</div>
			</div>

			<div class="kp-rate-guide__list wow fadeInUp" data-wow-duration="1200ms">
				{#each data.rooms as room, i (room.slug)}
					<a
						href="/rooms/{room.slug}"
						class="kp-rate-guide__item"
						aria-label="View {room.name}, ${room.rate_usd} per room per night"
					>
						<span class="kp-rate-guide__number" aria-hidden="true">0{i + 1}</span>
						<span class="kp-rate-guide__room">
							<strong>{room.name}</strong>
							<small>View room</small>
						</span>
						<span class="kp-rate-guide__price">
							<strong>${room.rate_usd}</strong>
							<small>USD / night</small>
						</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>

<BookingCta topSpacing />
