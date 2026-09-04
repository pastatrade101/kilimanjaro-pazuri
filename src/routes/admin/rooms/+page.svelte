<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let adding = $state(false);
</script>

<div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
	<h2 class="kp-amenity-group__title mb-0" style="border:0;padding:0;">Rooms and rates</h2>
	<button type="button" class="kp-btn kp-btn--primary" onclick={() => (adding = !adding)}>
		{adding ? 'Cancel' : 'Add a room'}
	</button>
</div>

<p class="kp-form__note mb-4">
	What you save here is what guests see. Occupancy and bed type stay hidden on the site until you
	fill them in — items 3 and 4 on the pre-launch checklist.
</p>

{#if form?.error}
	<div class="kp-alert kp-alert--bad" role="alert">{form.error}</div>
{/if}
{#if form?.added}
	<div class="kp-alert kp-alert--ok" role="status">{form.added} added.</div>
{/if}
{#if form?.removed}
	<div class="kp-alert kp-alert--ok" role="status">{form.removed} removed.</div>
{/if}

{#if adding}
	<section class="kp-editor-section">
		<h3 class="kp-editor-section__title">A new room</h3>
		<form method="POST" action="?/add" enctype="multipart/form-data" use:enhance class="kp-form">
			<div class="kp-field-row">
				<div class="kp-field">
					<label for="new-name">Room name</label>
					<input id="new-name" type="text" name="name" required />
				</div>
				<div class="kp-field">
					<label for="new-slug">Web address</label>
					<input id="new-slug" type="text" name="slug" placeholder="marangu" required />
					<span class="kp-form__note">Becomes /rooms/… and cannot be changed later.</span>
				</div>
			</div>
			<div class="kp-field">
				<label for="new-summary">One sentence about the room</label>
				<textarea id="new-summary" name="summary" rows="2" required></textarea>
			</div>
			<div class="kp-field-row">
				<div class="kp-field">
					<label for="new-rate">Rate, US dollars per night</label>
					<input id="new-rate" type="number" name="rate_usd" min="0" value="45" required />
				</div>
				<div class="kp-field">
					<label for="new-image">Photograph</label>
					<input id="new-image" type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" />
				</div>
			</div>
			<button type="submit" class="kp-btn kp-btn--primary">Add room</button>
		</form>
	</section>
{/if}

<section class="kp-editor-section">
	<h3 class="kp-editor-section__title">{data.rooms.length} rooms</h3>

	{#each data.rooms as room (room.slug)}
		<div class="kp-room-row">
			<img src={room.image} alt={room.name} />

			<div class="kp-room-row__detail">
				<h4>{room.name}</h4>
				<p>/rooms/{room.slug} · ${room.rate_usd} per night</p>
				<span class="kp-badge {room.is_available ? '' : 'kp-badge--muted'}">
					{room.is_available ? 'Available' : 'Not bookable'}
				</span>
			</div>

			<div class="kp-editor-list__controls">
				<a class="kp-btn kp-btn--outline" href="/admin/rooms/{room.slug}">Edit</a>
				<form
					method="POST"
					action="?/remove"
					use:enhance={({ cancel }) => {
						if (!confirm(`Remove ${room.name}? Its page will stop existing.`)) cancel();
					}}
				>
					<input type="hidden" name="slug" value={room.slug} />
					<button type="submit" class="kp-editor-list__remove">Remove</button>
				</form>
			</div>
		</div>
	{/each}
</section>
