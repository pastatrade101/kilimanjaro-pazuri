<script lang="ts">
	type HeroStat = {
		label: string;
		value: string;
	};

	type HeroAction = {
		label: string;
		href: string;
		external?: boolean;
	};

	let {
		title,
		crumb,
		image = '/assets/images/villa/hero-garden-suite.jpg',
		lead = '',
		stats = [],
		statsLabel = 'Highlights',
		actions = []
	}: {
		title: string;
		crumb: string;
		image?: string;
		lead?: string;
		stats?: HeroStat[];
		statsLabel?: string;
		actions?: HeroAction[];
	} = $props();
</script>

<section class="kp-pagehero" class:kp-pagehero--with-stats={stats.length > 0}>
	<div class="kp-pagehero__media">
		<img src={image} alt="" aria-hidden="true" fetchpriority="high" />
	</div>

	<div class="kp-pagehero__inner">
		<nav class="kp-pagehero__crumb" aria-label="Breadcrumb">
			<a href="/">Home</a>
			<span aria-hidden="true">/</span>
			<span aria-current="page">{crumb}</span>
		</nav>

		<h1 class="kp-pagehero__title page-header__title">{title}</h1>

		{#if lead}
			<p class="kp-pagehero__lead">{lead}</p>
		{/if}

		{#if stats.length > 0}
			<ul class="kp-pagehero__stats" aria-label={statsLabel}>
				{#each stats as stat (stat.label)}
					<li>
						<span class="kp-pagehero__stat-label">{stat.label}</span>
						<strong class="kp-pagehero__stat-value">{stat.value}</strong>
					</li>
				{/each}
			</ul>
		{/if}

		{#if actions.length > 0}
			<div class="kp-pagehero__actions">
				{#each actions as action, i (action.href)}
					<a
						href={action.href}
						class="kp-btn {i === 0 ? 'kp-btn--primary' : 'kp-btn--ghost'}"
						target={action.external ? '_blank' : undefined}
						rel={action.external ? 'noopener' : undefined}
					>
						{action.label}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
