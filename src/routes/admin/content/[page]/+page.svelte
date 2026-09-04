<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	/** Preview whatever the owner has just chosen, before it is saved. */
	let previews = $state<Record<string, string>>({});

	function preview(key: string, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		previews[key] = URL.createObjectURL(file);
	}
</script>

<div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
	<h2 class="kp-amenity-group__title mb-0" style="border:0;padding:0;">
		{data.page.charAt(0).toUpperCase() + data.page.slice(1)}
	</h2>
	<a href="/admin/content" class="kp-btn kp-btn--outline">All pages</a>
</div>

{#if form?.error}
	<div class="kp-alert kp-alert--bad" role="alert">{form.error}</div>
{/if}
{#if form?.saved !== undefined}
	<div class="kp-alert kp-alert--ok" role="status">
		Saved. {form.saved} field{form.saved === 1 ? '' : 's'} changed{form.reverted
			? `, ${form.reverted} put back to the deck's wording`
			: ''}.
	</div>
{/if}

<form method="POST" enctype="multipart/form-data" use:enhance class="kp-form">
	{#each data.sections as section (section.title)}
		<section class="kp-editor-section">
			<h3 class="kp-editor-section__title">{section.title}</h3>

			{#each section.items as item (item.key)}
				<div class="kp-field">
					<label for={item.key}>{item.label}</label>

					{#if item.kind === 'image'}
						<div class="kp-editor-image">
							<img src={previews[item.key] ?? item.value} alt="" />
							<div class="kp-editor-image__controls">
								<input
									id={item.key}
									type="text"
									name={item.key}
									value={item.value}
									spellcheck="false"
								/>
								<input
									type="file"
									name="upload:{item.key}"
									accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
									onchange={(e) => preview(item.key, e)}
								/>
								<span class="kp-form__note">
									Choose a photograph to replace it, or paste a path. Under 6 MB.
								</span>
							</div>
						</div>
					{:else if item.kind === 'long'}
						<textarea id={item.key} name={item.key} rows={Math.min(8, Math.ceil(item.value.length / 70) + 1)}
							>{item.value}</textarea
						>
					{:else}
						<input
							id={item.key}
							type={item.kind === 'email' ? 'email' : 'text'}
							name={item.key}
							value={item.value}
						/>
					{/if}
				</div>
			{/each}
		</section>
	{/each}

	<div class="kp-editor-save">
		<button type="submit" class="kp-btn kp-btn--primary">Save {data.page}</button>
		<a href="/{data.page === 'home' || data.page === 'site' ? '' : data.page}" class="kp-btn kp-btn--outline" target="_blank" rel="noopener">
			View the page
		</a>
	</div>
</form>
