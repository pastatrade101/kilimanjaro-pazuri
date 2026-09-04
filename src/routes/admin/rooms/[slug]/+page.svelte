<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const room = $derived(data.room);
	const images = $derived(data.images);
	const limitKb = $derived(Math.round(data.maxBytes / 1024));

	/** Warn before the upload is attempted, rather than after it is refused. */
	let tooBig = $state<string[]>([]);

	function checkSizes(event: Event) {
		const chosen = [...((event.currentTarget as HTMLInputElement).files ?? [])];
		tooBig = chosen.filter((f) => f.size > data.maxBytes).map((f) => f.name);
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
	<form method="POST" action="?/details" use:enhance class="kp-form">
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

<section class="kp-editor-section">
	<h3 class="kp-editor-section__title">Photographs</h3>
	<p class="kp-form__note">
		The featured photograph is the one on the room's card and in search previews. The rest appear
		on the room's own page. Keep each under {limitKb} KB — a room page shows several at once, and
		most guests arrive on a phone.
	</p>

	{#if form?.addedImages}
		<div class="kp-alert kp-alert--ok" role="status">
			{form.addedImages} photograph{form.addedImages === 1 ? '' : 's'} added.
		</div>
	{/if}

	<form method="POST" action="?/addImages" enctype="multipart/form-data" use:enhance class="kp-form">
		<div class="kp-field">
			<label for="files">Add photographs</label>
			<input
				id="files"
				type="file"
				name="files"
				accept="image/jpeg,image/png,image/webp,image/avif"
				multiple
				onchange={checkSizes}
			/>
			<span class="kp-form__note">Choose several at once if you like.</span>
			{#if tooBig.length > 0}
				<span class="kp-form__error">
					Too large, over {limitKb} KB: {tooBig.join(', ')}. Please resize before adding.
				</span>
			{/if}
		</div>
		<div class="kp-field">
			<label for="alt">Description</label>
			<input id="alt" type="text" name="alt" placeholder="What the photograph shows" />
			<span class="kp-form__note">Optional. Used by readers who cannot see the image.</span>
		</div>
		<button type="submit" class="kp-btn kp-btn--primary" disabled={tooBig.length > 0}>
			Add photographs
		</button>
	</form>

	<div class="kp-room-images">
		{#each images as image, i (image.id)}
			<figure class="kp-room-image" class:is-featured={image.is_featured}>
				<img src={image.src} alt={image.alt} />

				{#if image.is_featured}
					<span class="kp-room-image__flag">Featured</span>
				{/if}

				<figcaption>
					<form method="POST" action="?/describeImage" use:enhance class="kp-form">
						<input type="hidden" name="id" value={image.id} />
						<input type="text" name="alt" value={image.alt} placeholder="Description" />
						<button type="submit" class="kp-btn kp-btn--outline">Save</button>
					</form>

					<div class="kp-editor-list__controls">
						{#if !image.is_featured}
							<form method="POST" action="?/featureImage" use:enhance>
								<input type="hidden" name="id" value={image.id} />
								<button type="submit">Feature</button>
							</form>
						{/if}
						<form method="POST" action="?/moveImage" use:enhance>
							<input type="hidden" name="id" value={image.id} />
							<input type="hidden" name="direction" value="up" />
							<button type="submit" aria-label="Move earlier" disabled={i === 0}>↑</button>
						</form>
						<form method="POST" action="?/moveImage" use:enhance>
							<input type="hidden" name="id" value={image.id} />
							<input type="hidden" name="direction" value="down" />
							<button type="submit" aria-label="Move later" disabled={i === images.length - 1}>↓</button>
						</form>
						<form method="POST" action="?/removeImage" use:enhance>
							<input type="hidden" name="id" value={image.id} />
							<button type="submit" class="kp-editor-list__remove">Remove</button>
						</form>
					</div>
				</figcaption>
			</figure>
		{/each}
	</div>
</section>
