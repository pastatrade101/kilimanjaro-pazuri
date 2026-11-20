<script lang="ts">
	import { enhance } from '$app/forms';
	import Seo from '$lib/components/Seo.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import RoomCard from '$lib/components/RoomCard.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const content = $derived(data.content);
	const copy = $derived(content.rooms);
	const images = $derived(data.images ?? []);
	const site = $derived(content.site);
	const actions = $derived(content.actions);

	const room = $derived(data.room);
	const issues = $derived(form?.issues ?? {});
	const values = $derived(form?.values ?? {});

	let checkIn = $state('');
	let checkOut = $state('');
	let quote = $state<{ available: boolean; nights: number; totalUsd: number } | null>(null);
	let checking = $state(false);

	/** The night after arrival is the earliest a guest can leave. */
	const minCheckOut = $derived(
		checkIn
			? new Date(Date.parse(checkIn + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10)
			: data.from
	);

	/*
	 * Advisory only — the booking itself is settled by the database. This runs
	 * so a guest learns the nights are gone before filling the rest in, rather
	 * than after.
	 */
	$effect(() => {
		const from = checkIn;
		const to = checkOut;
		if (!from || !to || to <= from) {
			quote = null;
			return;
		}
		let dropped = false;
		checking = true;
		fetch(`/api/availability?room=${room.slug}&check_in=${from}&check_out=${to}`)
			.then((r) => r.json())
			.then((d) => {
				if (!dropped && !d.error) quote = d;
			})
			.catch(() => {})
			.finally(() => {
				if (!dropped) checking = false;
			});
		return () => {
			dropped = true;
		};
	});
	const heroStats = $derived([
		{ label: 'Nightly rate', value: `$${room.rate_usd} USD` },
		{ label: 'Bathroom', value: room.bathroom },
		{ label: 'Breakfast', value: 'Included' }
	]);
</script>

<Seo title="{room.name} | {site.name} Moshi" description="{room.summary} {copy.pageIntro}" />

<PageHeader
	title={room.name}
	crumb={room.name}
	image={room.image}
	lead={room.summary}
	stats={heroStats}
	statsLabel="Room highlights"
/>

<section class="apartment-details-one section-space">
	<div class="container">
		<div class="row gutter-y-50">
			<div class="col-lg-7">
				<div class="kp-room__hero hover:shine wow fadeInLeft" data-wow-duration="1200ms">
					<img src={room.image} alt={room.name} width="900" height="600" />
				</div>

				{#if images.length > 1}
					<!-- The rest of the room, beyond the one its card shows. -->
					<div class="kp-room__gallery wow fadeInUp" data-wow-duration="1200ms">
						{#each images.filter((image) => image.src !== room.image) as image (image.id)}
							<a href={image.src} class="img-popup kp-room__gallery__item" data-group="room">
								<img src={image.src} alt={image.alt || room.name} loading="lazy" />
							</a>
						{/each}
					</div>
				{/if}

				<div class="sec-title text-start mt-5">
					<div class="sec-title__top justify-content-start">
						<span class="line-left"></span>
						<h6 class="sec-title__tagline">Your room</h6>
					</div>
					<h3 class="sec-title__title kp-reveal">{room.name}</h3>
				</div>

				<p class="wow fadeInUp" data-wow-duration="1500ms">{copy.pageIntro}</p>
				<p class="wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="100ms">{room.summary}</p>

				<dl class="kp-room__facts wow fadeInUp" data-wow-duration="1200ms">
					<div>
						<dt>Rate</dt>
						<dd class="kp-room__facts__value">${room.rate_usd} <small>per night</small></dd>
					</div>
					{#if room.guests !== copy.unconfirmed}
						<div>
							<dt>Guests</dt>
							<dd class="kp-room__facts__value">{room.guests}</dd>
						</div>
					{/if}
					{#if room.bed !== copy.unconfirmed}
						<div>
							<dt>Bed</dt>
							<dd class="kp-room__facts__value">{room.bed}</dd>
						</div>
					{/if}
					<div>
						<dt>Bathroom</dt>
						<dd class="kp-room__facts__value">{room.bathroom}</dd>
					</div>
					<div>
						<dt>Breakfast</dt>
						<dd class="kp-room__facts__value">Included</dd>
					</div>
				</dl>

				<h4 class="kp-amenity-group__title">Always included</h4>
				<ul class="kp-amenity-list wow fadeInUp" data-wow-duration="1500ms">
					{#each copy.included as item (item)}
						<li><i class="icon-check-star"></i><span>{item}</span></li>
					{/each}
				</ul>
			</div>

			<div class="col-lg-5">
				<aside class="kp-booking">
					<div class="kp-booking__card">
						<div class="kp-booking__price">
							<span class="kp-booking__amount">${room.rate_usd}</span>
							<span class="kp-booking__per">US dollars, per room per night</span>
						</div>

						{#if form?.success}
							<div class="kp-alert kp-alert--ok" role="status">
								<strong>Your dates are held.</strong>
								<span class="kp-booking__reference">{form.reference}</span>
								The {room.name} is reserved for you for {form.nights}
								{form.nights === 1 ? 'night' : 'nights'}, ${form.total} USD, payable at the
								villa. We will confirm by email shortly — please quote that reference.
							</div>
						{:else}
							{#if issues.form}
								<div class="kp-alert kp-alert--bad" role="alert">{issues.form}</div>
							{/if}

							<h2 class="kp-booking__title">{copy.cta}</h2>

							<form method="POST" use:enhance class="kp-form">
								<div class="kp-field-row">
									<div class="kp-field">
										<label for="bk-name">Your name</label>
										<input id="bk-name" type="text" name="name" autocomplete="name" required value={values.name ?? ''} />
										{#if issues.name}<span class="kp-form__error">{issues.name}</span>{/if}
									</div>

									<div class="kp-field">
										<label for="bk-email">Your email</label>
										<input id="bk-email" type="email" name="email" autocomplete="email" required value={values.email ?? ''} />
										{#if issues.email}<span class="kp-form__error">{issues.email}</span>{/if}
									</div>
								</div>

								<div class="kp-field-row">
									<div class="kp-field">
										<label for="bk-phone">Telephone or WhatsApp</label>
										<input id="bk-phone" type="tel" name="phone" autocomplete="tel" value={values.phone ?? ''} />
										{#if issues.phone}<span class="kp-form__error">{issues.phone}</span>{/if}
									</div>

									<div class="kp-field">
										<label for="bk-guests">Guests</label>
										<input id="bk-guests" type="number" name="guests" min="1" max="20" required value={values.guests ?? ''} />
										{#if issues.guests}<span class="kp-form__error">{issues.guests}</span>{/if}
									</div>
								</div>

								<div class="kp-field-row">
									<div class="kp-field">
										<label for="bk-in">Arrival</label>
										<input id="bk-in" type="date" name="check_in" required bind:value={checkIn}
											min={data.from} max={data.until} />
										{#if issues.check_in}<span class="kp-form__error">{issues.check_in}</span>{/if}
									</div>
									<div class="kp-field">
										<label for="bk-out">Departure</label>
										<input id="bk-out" type="date" name="check_out" required bind:value={checkOut}
											min={minCheckOut} max={data.until} />
										{#if issues.check_out}<span class="kp-form__error">{issues.check_out}</span>{/if}
									</div>
								</div>

								{#if checking}
									<p class="kp-booking__quote" aria-live="polite">Checking those nights…</p>
								{:else if quote}
									<p
										class="kp-booking__quote"
										class:kp-booking__quote--bad={!quote.available}
										aria-live="polite"
									>
										{#if quote.available}
											<strong>Free</strong> — {quote.nights}
											{quote.nights === 1 ? 'night' : 'nights'} ·
											<strong>${quote.totalUsd} USD</strong> in total, payable at the villa.
										{:else}
											Those nights are already taken. Please try different dates.
										{/if}
									</p>
								{/if}

								<div class="kp-field">
									<label for="bk-message">Anything we should know?</label>
									<textarea id="bk-message" name="message" rows="3">{values.message ?? ''}</textarea>
									{#if issues.message}<span class="kp-form__error">{issues.message}</span>{/if}
								</div>

								<div class="kp-honeypot" aria-hidden="true">
									<label for="bk-website">Leave this empty</label>
									<input type="text" id="bk-website" name="website" tabindex="-1" autocomplete="off" />
								</div>

								<button
									type="submit"
									class="kp-btn kp-btn--primary kp-booking__submit"
									disabled={quote ? !quote.available : false}
								>
									{quote && !quote.available ? 'Those nights are taken' : 'Request these dates'}
								</button>
								<p class="kp-booking__terms">
									No payment is taken now. We hold your dates and confirm by email; you settle
									at the villa.
								</p>
							</form>
						{/if}

						<div class="kp-booking__direct">
							<span class="kp-booking__or">Or reach us directly</span>
							<div class="kp-booking__links">
								<a href={actions.whatsapp.href} target="_blank" rel="noopener">
									<i class="fab fa-whatsapp" aria-hidden="true"></i> {actions.whatsapp.label}
								</a>
								<a href={actions.call.href}>
									<i class="icon-phone-call" aria-hidden="true"></i> {actions.call.label}
								</a>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	</div>
</section>

<section class="apartment-one section-space-bottom">
	<div class="container">
		<div class="sec-title text-center">
			<div class="sec-title__top justify-content-center">
				<span class="line-left"></span>
				<h6 class="sec-title__tagline">Other rooms</h6>
				<span class="line-right"></span>
			</div>
			<h3 class="sec-title__title kp-reveal">You may also like</h3>
		</div>
		<div class="row gutter-y-30">
			{#each data.others as other, i (other.slug)}
				<div class="col-lg-4 col-md-6">
					<RoomCard room={other} delay={150 + i * 100} />
				</div>
			{/each}
		</div>
	</div>
</section>
