<script lang="ts">
	import type { Room } from '$lib/server/repo';
	import { rooms as copy } from '$lib/content/site';

	let { room, delay = 200 }: { room: Room; delay?: number } = $props();

	/** Occupancy and bed type are unconfirmed for now, so the card shows what
	 *  is actually true of every room instead of a placeholder. */
	const confirmed = $derived(
		[
			room.bed !== copy.unconfirmed ? { icon: 'icon-bedroom', label: room.bed } : null,
			room.guests !== copy.unconfirmed
				? { icon: 'icon-user', label: `${room.guests} guests` }
				: null
		].filter(Boolean) as { icon: string; label: string }[]
	);

	const facts = $derived(
		confirmed.length > 0
			? confirmed
			: [
					{ icon: 'icon-bath', label: 'Private bathroom' },
					{ icon: 'icon-restaurant', label: 'Breakfast included' }
				]
	);
</script>

<div class="apartment-card wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="{delay}ms">
	<div class="apartment-card__image hover:shine">
		<img src={room.image} alt={room.name} width="900" height="675" loading="lazy" />
	</div>
	<div class="apartment-card__content">
		<div class="apartment-card__top">
			<h3 class="apartment-card__title">
				<a href="/rooms/{room.slug}">{room.name}</a>
			</h3>
			<p class="apartment-card__description">{room.summary}</p>
		</div>
		<ul class="apartment-card__list list-unstyled">
			{#each facts as fact (fact.label)}
				<li class="apartment-card__list__item">
					<i class={fact.icon} aria-hidden="true"></i><span>{fact.label}</span>
				</li>
			{/each}
		</ul>
		<div class="apartment-card__bottom">
			<span class="kp-rate__price">${room.rate_usd} <small>per night</small></span>
			<a href="/rooms/{room.slug}" class="zoomvilla-btn">
				View room<i class="icon-angle-small-right" aria-hidden="true"></i>
			</a>
		</div>
	</div>
</div>
