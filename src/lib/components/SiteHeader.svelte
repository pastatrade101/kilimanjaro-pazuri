<script lang="ts">
	import { page } from '$app/state';
	const content = $derived(page.data.content);
	const site = $derived(content.site);
	const nav = $derived(content.nav);
	const actions = $derived(content.actions);
	import { openDrawer } from '$lib/state/ui.svelte';

	let scrolled = $state(false);

	function isCurrent(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:window onscroll={() => (scrolled = window.scrollY > 12)} />

<!--
	One row: mark, navigation, one action. The full nav appears once there is
	room for all seven links; below that the drawer carries them.
-->
<header class="kp-header" class:kp-header--scrolled={scrolled}>
	<div class="kp-header__inner">
		<a class="kp-header__brand" href="/" aria-label={site.name}>
			<img src="/assets/images/villa/logo-dark.svg" alt={site.name} width="240" height="52" />
		</a>

		<nav class="kp-header__nav" aria-label="Main">
			<ul>
				{#each nav as item (item.href)}
					<li>
						<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="kp-header__actions">
			<a
				class="kp-btn kp-btn--primary kp-header__cta"
				href={actions.whatsapp.href}
				target="_blank"
				rel="noopener"
			>
				<i class="fab fa-whatsapp" aria-hidden="true"></i>
				<span class="kp-header__cta__label">{actions.whatsapp.label}</span>
			</a>

			<button
				class="kp-burger"
				type="button"
				aria-label="Open menu"
				aria-expanded="false"
				onclick={openDrawer}
			>
				<span></span><span></span><span></span>
			</button>
		</div>
	</div>
</header>
