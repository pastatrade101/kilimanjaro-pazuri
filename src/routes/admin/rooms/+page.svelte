<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h2 class="kp-amenity-group__title">Rooms and rates</h2>
<p class="kp-form__note mb-4">
	What you save here is what guests see. Occupancy and bed type stay hidden on the site until you
	fill them in — items 3 and 4 on the pre-launch checklist. The web address of each room does not
	change when you rename it.
</p>

{#if form?.error}
	<div class="kp-alert kp-alert--bad" role="alert">{form.error}</div>
{/if}
{#if form?.saved}
	<div class="kp-alert kp-alert--ok" role="status">Saved.</div>
{/if}

<div class="row gutter-y-30">
	{#each data.rooms as room (room.slug)}
		<div class="col-lg-6">
			<div class="kp-rates">
				<div class="py-4">
					<div class="d-flex align-items-center gap-3 mb-3">
						<img
							src={room.image}
							alt={room.name}
							width="80"
							height="60"
							style="object-fit:cover;"
						/>
						<div>
							<h3 class="kp-rate__name mb-0">{room.name}</h3>
							<p class="kp-rate__summary">/rooms/{room.slug}</p>
						</div>
					</div>

					<form method="POST" use:enhance class="kp-form">
						<input type="hidden" name="slug" value={room.slug} />

						<div class="kp-field">
							<label for="name-{room.slug}">Room name</label>
							<input
								id="name-{room.slug}"
								type="text"
								name="name"
								value={room.name}
								required
								minlength="2"
								maxlength="80"
							/>
						</div>

						<div class="kp-field-row">
							<div class="kp-field">
								<label for="rate-{room.slug}">Rate, US dollars per night</label>
								<input
									id="rate-{room.slug}"
									type="number"
									name="rate_usd"
									min="0"
									value={room.rate_usd}
									required
								/>
							</div>
							<div class="kp-field">
								<label for="guests-{room.slug}">Maximum guests</label>
								<input id="guests-{room.slug}" type="text" name="guests" value={room.guests} />
							</div>
						</div>

						<div class="kp-field-row">
							<div class="kp-field">
								<label for="bed-{room.slug}">Bed</label>
								<input id="bed-{room.slug}" type="text" name="bed" value={room.bed} />
							</div>
							<div class="kp-field">
								<label for="bathroom-{room.slug}">Bathroom</label>
								<input
									id="bathroom-{room.slug}"
									type="text"
									name="bathroom"
									value={room.bathroom}
								/>
							</div>
						</div>

						<div class="kp-field">
							<label class="kp-check" for="available-{room.slug}">
								<input
									id="available-{room.slug}"
									type="checkbox"
									name="is_available"
									checked={room.is_available}
								/>
								<span>Available for booking</span>
							</label>
						</div>

						<button type="submit" class="kp-btn kp-btn--primary kp-booking__submit">
							Save {room.name}
						</button>
					</form>
				</div>
			</div>
		</div>
	{/each}
</div>
