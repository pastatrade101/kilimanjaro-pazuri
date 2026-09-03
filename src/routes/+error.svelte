<script lang="ts">
	import { page } from '$app/state';
	import { site } from '$lib/content/site';
</script>

<svelte:head>
	<title>{page.status} | {site.name}</title>
</svelte:head>

<section class="section-space">
	<div class="container text-center">
		<h1 class="kp-room__price" style="font-size:96px;">{page.status}</h1>
		<h2 class="sec-title__title kp-reveal">{page.error?.message ?? 'That page is not here.'}</h2>
		<p class="mt-3">
			The page you were looking for is not at this address, but the villa is still waiting for you.
		</p>
		<div class="kp-hero__actions justify-content-center">
			<a href="/" class="zoomvilla-btn">Back to the villa<i class="icon-angle-small-right"></i></a>
			<a href="/rooms" class="zoomvilla-btn zoomvilla-btn--border">
				View rooms and rates<i class="icon-angle-small-right"></i>
			</a>
		</div>
	</div>
</section>
