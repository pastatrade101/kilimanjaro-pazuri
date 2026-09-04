<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h2 class="kp-amenity-group__title">Gallery</h2>
<p class="kp-form__note mb-4">
	The photography, grouped as the villa is lived. The collection name is the heading it appears
	under on the gallery page.
</p>

{#if form?.error}
	<div class="kp-alert kp-alert--bad" role="alert">{form.error}</div>
{/if}
{#if form?.added || form?.updated || form?.removed || form?.moved}
	<div class="kp-alert kp-alert--ok" role="status">Gallery updated.</div>
{/if}

<section class="kp-editor-section">
	<h3 class="kp-editor-section__title">Add a photograph</h3>
	<form method="POST" action="?/add" enctype="multipart/form-data" use:enhance class="kp-form">
		<div class="kp-field">
			<label for="new-file">Photograph</label>
			<input id="new-file" type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" />
			<span class="kp-form__note">Or paste a path below instead. Under 6 MB.</span>
		</div>
		<div class="kp-field-row">
			<div class="kp-field">
				<label for="new-src">Path</label>
				<input id="new-src" type="text" name="src" placeholder="/assets/images/villa/…" />
			</div>
			<div class="kp-field">
				<label for="new-grouping">Collection</label>
				<input id="new-grouping" type="text" name="grouping" list="kp-groupings" required />
				<datalist id="kp-groupings">
					{#each data.groupings as grouping (grouping)}<option value={grouping}></option>{/each}
				</datalist>
			</div>
		</div>
		<div class="kp-field">
			<label for="new-alt">Description</label>
			<input id="new-alt" type="text" name="alt" required />
		</div>
		<button type="submit" class="kp-btn kp-btn--primary">Add photograph</button>
	</form>
</section>

<section class="kp-editor-section">
	<h3 class="kp-editor-section__title">{data.images.length} photographs</h3>

	{#each data.images as image, i (image.id)}
		<div class="kp-gallery-row">
			<img src={image.src} alt={image.alt} />

			<form method="POST" action="?/update" use:enhance class="kp-gallery-row__fields kp-form">
				<input type="hidden" name="id" value={image.id} />
				<div class="kp-field">
					<label for="alt-{image.id}">Description</label>
					<input id="alt-{image.id}" type="text" name="alt" value={image.alt} />
				</div>
				<div class="kp-field">
					<label for="grouping-{image.id}">Collection</label>
					<input id="grouping-{image.id}" type="text" name="grouping" value={image.grouping} list="kp-groupings" />
				</div>
				<button type="submit" class="kp-btn kp-btn--outline">Save</button>
			</form>

			<div class="kp-editor-list__controls">
				<form method="POST" action="?/move" use:enhance>
					<input type="hidden" name="id" value={image.id} />
					<input type="hidden" name="direction" value="up" />
					<button type="submit" aria-label="Move up" disabled={i === 0}>↑</button>
				</form>
				<form method="POST" action="?/move" use:enhance>
					<input type="hidden" name="id" value={image.id} />
					<input type="hidden" name="direction" value="down" />
					<button type="submit" aria-label="Move down" disabled={i === data.images.length - 1}>↓</button>
				</form>
				<form method="POST" action="?/remove" use:enhance>
					<input type="hidden" name="id" value={image.id} />
					<button type="submit" class="kp-editor-list__remove">Remove</button>
				</form>
			</div>
		</div>
	{/each}
</section>
