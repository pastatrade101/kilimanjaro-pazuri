<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const room = $derived(data.room);
	let preview = $state<string | null>(null);

	function choose(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (file) preview = URL.createObjectURL(file);
	}
</script>

<div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
	<h2 class="kp-amenity-group__title mb-0" style="border:0;padding:0;">{room.name}</h2>
	<div class="d-flex gap-2">
		<a href="/rooms/{room.slug}" class="kp-btn kp-btn--outline" target="_blank" rel="noopener">
			View the page
		</a>
		<a href="/admin/rooms" class="kp-btn kp-btn--outline">All rooms</a>
	</div>
</div>

{#if form?.error}
	<div class="kp-alert kp-alert--bad" role="alert">{form.error}</div>
{/if}

<section class="kp-editor-section">
	<form method="POST" enctype="multipart/form-data" use:enhance class="kp-form">
		<div class="kp-field">
			<label for="name">Room name</label>
			<input id="name" type="text" name="name" value={room.name} required maxlength="80" />
			<span class="kp-form__note">
				The web address stays /rooms/{room.slug}, so links and past enquiries keep working.
			</span>
		</div>

		<div class="kp-field">
			<label for="summary">One sentence about the room</label>
			<textarea id="summary" name="summary" rows="2" required>{room.summary}</textarea>
		</div>

		<div class="kp-field">
			<label for="image">Photograph</label>
			<div class="kp-editor-image">
				<img src={preview ?? room.image} alt="" />
				<div class="kp-editor-image__controls">
					<input id="image" type="text" name="image" value={room.image} spellcheck="false" />
					<input
						type="file"
						name="file"
						accept="image/jpeg,image/png,image/webp,image/avif"
						onchange={choose}
					/>
					<span class="kp-form__note">Choose a photograph to replace it. Under 6 MB.</span>
				</div>
			</div>
		</div>

		<div class="kp-field-row">
			<div class="kp-field">
				<label for="rate">Rate, US dollars per night</label>
				<input id="rate" type="number" name="rate_usd" min="0" value={room.rate_usd} required />
			</div>
			<div class="kp-field">
				<label for="guests">Maximum guests</label>
				<input id="guests" type="text" name="guests" value={room.guests} />
			</div>
		</div>

		<div class="kp-field-row">
			<div class="kp-field">
				<label for="bed">Bed</label>
				<input id="bed" type="text" name="bed" value={room.bed} />
			</div>
			<div class="kp-field">
				<label for="bathroom">Bathroom</label>
				<input id="bathroom" type="text" name="bathroom" value={room.bathroom} />
			</div>
		</div>

		<div class="kp-field">
			<label class="kp-check" for="available">
				<input id="available" type="checkbox" name="is_available" checked={room.is_available} />
				<span>Available for booking</span>
			</label>
		</div>

		<button type="submit" class="kp-btn kp-btn--primary">Save {room.name}</button>
	</form>
</section>
