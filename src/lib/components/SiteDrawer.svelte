<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	const content = $derived(page.data.content);
	const site = $derived(content.site);
	const nav = $derived(content.nav);
	const actions = $derived(content.actions);
	import { ui, closeDrawer } from '$lib/state/ui.svelte';

	let panel = $state<HTMLElement | null>(null);

	afterNavigate(() => closeDrawer());

	// Hold the page still while the drawer is over it.
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = ui.drawerOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	$effect(() => {
		if (ui.drawerOpen && panel) panel.focus();
	});

	function isCurrent(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && ui.drawerOpen) closeDrawer();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="kp-drawer" class:is-open={ui.drawerOpen} aria-hidden={!ui.drawerOpen}>
	<button class="kp-drawer__scrim" type="button" aria-label="Close menu" onclick={closeDrawer}
	></button>

	<div
		class="kp-drawer__panel"
		role="dialog"
		aria-modal="true"
		aria-label="Menu"
		tabindex="-1"
		bind:this={panel}
	>
		<div class="kp-drawer__head">
			<a href="/" class="kp-drawer__brand" aria-label={site.name}>
				<img src="/assets/images/villa/logo-light.svg" alt={site.name} width="200" height="42" />
			</a>
			<button class="kp-drawer__close" type="button" aria-label="Close menu" onclick={closeDrawer}>
				<span></span><span></span>
			</button>
		</div>

		<nav class="kp-drawer__nav" aria-label="Main">
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

		<div class="kp-drawer__foot">
			<a class="kp-btn kp-btn--primary" href={actions.whatsapp.href} target="_blank" rel="noopener">
				{actions.whatsapp.label}
			</a>

			<ul class="kp-drawer__contact">
				<li><a href="mailto:{site.email}">{site.email}</a></li>
				<li><a href="tel:{site.phoneHref}">{site.phone}</a></li>
				<li>{site.location}</li>
			</ul>
		</div>
	</div>
</div>
