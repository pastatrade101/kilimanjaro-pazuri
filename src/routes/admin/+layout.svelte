<script lang="ts">
	import { page } from '$app/state';
	import { site } from '$lib/content/site';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const links = [
		{ href: '/admin', label: 'Enquiries' },
		{ href: '/admin/rooms', label: 'Rooms and rates' },
		{ href: '/admin/content', label: 'Pages and copy' }
	];
</script>

<svelte:head>
	<title>Admin | {site.name}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="kp-admin">
	<div class="container">
		<div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
			<div>
				<h1 class="kp-amenity-group__title mb-0" style="border:0;padding:0;">
					{site.name}
				</h1>
				<p class="mb-0 kp-form__note">Villa administration</p>
			</div>

			{#if data.admin}
				<div class="d-flex align-items-center gap-3 flex-wrap">
					{#each links as link (link.href)}
						<a
							href={link.href}
							class="kp-btn {page.url.pathname === link.href || (link.href !== '/admin' && page.url.pathname.startsWith(link.href)) ? 'kp-btn--primary' : 'kp-btn--outline'}"
						>
							{link.label}
						</a>
					{/each}
					<a href="/" class="kp-btn kp-btn--outline">View site</a>
					<form method="POST" action="/admin/logout">
						<button type="submit" class="kp-btn kp-btn--outline">Sign out</button>
					</form>
				</div>
			{/if}
		</div>

		{@render children()}
	</div>
</div>
