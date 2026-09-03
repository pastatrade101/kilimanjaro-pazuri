<script lang="ts">
	import { booking, actions } from '$lib/content/site';

	let { topSpacing = false }: { topSpacing?: boolean } = $props();
</script>

<!-- Two actions, in this order, on every page. -->
<section
	class="kp-booking-cta section-space-bottom"
	class:kp-booking-cta--top-spaced={topSpacing}
>
	<div class="container">
		<div class="sec-title text-center">
			<div class="sec-title__top justify-content-center">
				<span class="line-left"></span>
				<h6 class="sec-title__tagline">Booking</h6>
				<span class="line-right"></span>
			</div>
			<h3 class="sec-title__title kp-reveal">{booking.title}</h3>
		</div>
		<p class="text-center wow fadeInUp" data-wow-duration="1500ms">{booking.text}</p>
		<div class="kp-hero__actions justify-content-center wow fadeInUp" data-wow-duration="1500ms">
			<a href={actions.whatsapp.href} class="zoomvilla-btn" target="_blank" rel="noopener">
				{actions.whatsapp.label}<i class="icon-angle-small-right"></i>
			</a>
			<a href={actions.call.href} class="zoomvilla-btn zoomvilla-btn--border">
				{actions.call.label}<i class="icon-phone-call"></i>
			</a>
		</div>
	</div>
</section>
