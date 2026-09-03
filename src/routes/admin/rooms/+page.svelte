<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h2 class="kp-amenity-group__title">Rooms and rates</h2>
<p class="kp-form__note mb-4">
	Occupancy and bed type for every room are still to be confirmed — items 3 and 4 on the
	pre-launch checklist. What you save here is what guests see.
</p>

{#if form?.error}
	<div class="kp-alert kp-alert--bad">{form.error}</div>
{/if}
{#if form?.saved}
	<div class="kp-alert kp-alert--ok">Saved.</div>
{/if}

<div class="row gutter-y-30">
	{#each data.rooms as room (room.slug)}
		<div class="col-lg-6">
			<div class="kp-rates">
				<div class="py-4">
					<div class="d-flex align-items-center gap-3 mb-3">
						<img src={room.image} alt={room.name} width="80" height="60" style="object-fit:cover;border-radius:3px;" />
						<div>
							<h3 class="kp-rate__name mb-0">{room.name}</h3>
							<p class="kp-rate__summary">{room.summary}</p>
						</div>
					</div>

					<form method="POST" use:enhance class="form-one">
						<input type="hidden" name="slug" value={room.slug} />
						<div class="form-one__group">
							<div class="form-one__control">
								<input type="number" name="rate_usd" min="0" value={room.rate_usd} aria-label="Rate in US dollars" />
							</div>
							<div class="form-one__control">
								<input type="text" name="guests" value={room.guests} aria-label="Maximum guests" />
							</div>
							<div class="form-one__control">
								<input type="text" name="bed" value={room.bed} aria-label="Bed type" />
							</div>
							<div class="form-one__control">
								<input type="text" name="bathroom" value={room.bathroom} aria-label="Bathroom" />
							</div>
							<div class="form-one__control form-one__control--full">
								<label>
									<input type="checkbox" name="is_available" checked={room.is_available === 1} />
									Available for booking
								</label>
							</div>
							<div class="form-one__control form-one__control--full">
								<button type="submit" class="zoomvilla-btn">
									Save {room.name}<i class="icon-angle-small-right"></i>
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/each}
</div>
