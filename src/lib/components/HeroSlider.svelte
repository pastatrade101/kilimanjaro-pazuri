<script lang="ts">
	import { onMount } from 'svelte';

	type Slide = { src: string; alt: string; caption: string };

	let {
		slides,
		interval = 6000
	}: { slides: Slide[]; interval?: number } = $props();

	let index = $state(0);
	let hovering = $state(false);
	let playing = $state(true);
	let reduced = $state(false);

	function go(next: number) {
		index = (next + slides.length) % slides.length;
	}

	onMount(() => {
		// The owl carousel this replaces mis-measured its stage and parked the
		// active slide off-screen. A timer and two CSS transitions do the same
		// job with nothing to measure.
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduced = query.matches;
		playing = !query.matches;

		const onChange = (e: MediaQueryListEvent) => {
			reduced = e.matches;
			playing = !e.matches;
		};
		query.addEventListener('change', onChange);

		const id = setInterval(() => {
			if (playing && !hovering && !document.hidden) go(index + 1);
		}, interval);

		return () => {
			clearInterval(id);
			query.removeEventListener('change', onChange);
		};
	});
</script>

<div
	class="kp-hero__slider"
	class:is-still={reduced}
	role="group"
	aria-roledescription="carousel"
	aria-label="Photographs of the villa"
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}
	onfocusin={() => (hovering = true)}
	onfocusout={() => (hovering = false)}
>
	{#each slides as slide, i (slide.src)}
		<div class="kp-hero__slide" class:is-active={i === index} aria-hidden={i !== index}>
			<img
				src={slide.src}
				alt={slide.alt}
				fetchpriority={i === 0 ? 'high' : 'low'}
				loading={i === 0 ? 'eager' : 'lazy'}
			/>
		</div>
	{/each}
</div>

<div class="kp-hero__controls">
	<p class="kp-hero__caption">{slides[index].caption}</p>

	<div class="kp-hero__dots">
		{#each slides as slide, i (slide.src)}
			<button
				type="button"
				class="kp-hero__dot"
				class:is-active={i === index}
				aria-label="Show {slide.caption}"
				aria-current={i === index ? 'true' : undefined}
				onclick={() => go(i)}
			>
				<span class="kp-hero__dot__num">0{i + 1}</span>
				<span class="kp-hero__dot__rule"></span>
			</button>
		{/each}

		<button
			type="button"
			class="kp-hero__play"
			aria-label={playing ? 'Pause the photographs' : 'Play the photographs'}
			onclick={() => (playing = !playing)}
		>
			<i class={playing ? 'fas fa-pause' : 'fas fa-play'} aria-hidden="true"></i>
		</button>
	</div>
</div>
