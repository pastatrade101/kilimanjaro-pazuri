<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h2 class="kp-amenity-group__title">Pages and their sections</h2>
<p class="kp-form__note mb-4">
	Every heading, paragraph, contact detail and photograph on the site. A field left as the brand
	deck wrote it is not stored at all, so you can always change your mind by putting the original
	words back. {data.edited} field{data.edited === 1 ? '' : 's'} currently differ from the deck.
</p>

<div class="row gutter-y-30">
	{#each data.pages as page (page.key)}
		<div class="col-lg-4 col-md-6">
			<a class="kp-admin-card" href="/admin/content/{page.key}">
				<h3>{page.title}</h3>
				<p>{page.blurb}</p>
				<span class="kp-admin-card__meta">{page.fields} fields</span>
			</a>
		</div>
	{/each}
</div>
