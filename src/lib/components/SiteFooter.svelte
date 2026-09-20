<script lang="ts">
	import { page } from '$app/state';

	const content = $derived(page.data.content);
	const site = $derived(content.site);
	const nav = $derived(content.nav);
	const footer = $derived(content.footer);
	const actions = $derived(content.actions);
</script>

<!--
	The footer repeats the essentials so no page is a dead end: who we are,
	where to go next, and how to reach us. The template's decorative shapes
	were unlicensed placeholder images — they are gone.
-->
<footer class="kp-footer">
	<div class="kp-footer__inner">
		<div class="kp-footer__brand">
			<a href="/" aria-label={site.name}>
				<img src="/assets/images/villa/logo-light.png" alt={site.name} width="108" height="54" />
			</a>
			<p class="kp-footer__line">{footer.line}</p>
			<p class="kp-footer__text">{footer.text}</p>
		</div>

		<nav class="kp-footer__col" aria-label="Footer">
			<h2 class="kp-footer__heading">Explore</h2>
			<ul class="kp-footer__links">
				{#each nav as item (item.href)}
					<li><a href={item.href}>{item.label}</a></li>
				{/each}
			</ul>
		</nav>

		<div class="kp-footer__col">
			<h2 class="kp-footer__heading">Reach us</h2>
			<ul class="kp-footer__contact">
				<li>
					<span class="kp-footer__label">Email</span>
					<a href="mailto:{site.email}">{site.email}</a>
				</li>
				<li>
					<span class="kp-footer__label">Telephone and WhatsApp</span>
					<a href="tel:{site.phoneHref}">{site.phone}</a>
				</li>
				<li>
					<span class="kp-footer__label">Where we are</span>
					<a href="/location">{site.location}</a>
				</li>
			</ul>

			<div class="kp-footer__actions">
				<a
					class="kp-btn kp-btn--ghost"
					href={actions.whatsapp.href}
					target="_blank"
					rel="noopener"
				>
					{actions.whatsapp.label}
				</a>
			</div>
		</div>
	</div>

	<div class="kp-footer__bottom">
		<p class="kp-footer__copyright">{footer.copyright}</p>
		<p class="kp-footer__tagline">{site.tagline}</p>
	</div>
</footer>
