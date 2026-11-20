<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const filters = [
		{ key: null, label: 'All' },
		{ key: 'pending', label: 'Awaiting you' },
		{ key: 'confirmed', label: 'Confirmed' },
		{ key: 'declined', label: 'Declined' },
		{ key: 'cancelled', label: 'Cancelled' },
		{ key: 'blocked', label: 'Blocked nights' }
	];

	function href(key: string | null) {
		const url = new URL(page.url);
		if (key) url.searchParams.set('status', key);
		else url.searchParams.delete('status');
		return url.pathname + url.search;
	}

	/** A number the owner can read at a glance, rather than an ISO string. */
	function pretty(iso: string) {
		return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	/** Replying on WhatsApp is how this villa actually talks to guests. */
	function whatsapp(booking: { phone: string | null; reference: string; room_name?: string }) {
		const digits = (booking.phone ?? '').replace(/[^0-9]/g, '');
		const text = encodeURIComponent(
			`Hello, about your booking ${booking.reference} for the ${booking.room_name ?? 'villa'} — `
		);
		return `https://wa.me/${digits}?text=${text}`;
	}

	const arriving = $derived(
		data.bookings.filter((b) => b.status === 'confirmed' && b.check_in >= data.today).length
	);
</script>

<svelte:head><title>Bookings | Kilimanjaro Pazuri</title></svelte:head>

{#if form?.error}
	<div class="kp-alert kp-alert--bad" role="alert">{form.error}</div>
{/if}

<div class="row gutter-y-30 mb-4">
	{#each [['pending', 'Awaiting you'], ['confirmed', 'Confirmed'], ['blocked', 'Blocked'], ['declined', 'Declined']] as [key, label] (key)}
		<div class="col-6 col-lg-3">
			<div class="kp-rates text-center py-4">
				<span class="kp-room__price">{data.counts[key] ?? 0}</span>
				<span class="d-block kp-rate__summary">{label}</span>
			</div>
		</div>
	{/each}
</div>

{#if arriving > 0}
	<div class="kp-alert kp-alert--ok mb-3">
		{arriving} confirmed {arriving === 1 ? 'arrival' : 'arrivals'} still to come.
	</div>
{/if}

<div class="d-flex flex-wrap gap-2 mb-3">
	{#each filters as filter (filter.label)}
		<a
			href={href(filter.key)}
			class="zoomvilla-btn {data.filter === filter.key ? '' : 'zoomvilla-btn--border'}"
		>
			{filter.label}
		</a>
	{/each}
</div>

<!--
	Taking nights off sale. It writes into the same table as a booking, so the
	database refuses a block that would sit on top of one.
-->
<details class="kp-admin__block mb-4">
	<summary>Close nights off sale</summary>
	<form method="POST" action="?/block" use:enhance class="kp-form kp-admin__block__form">
		<div class="kp-field-row">
			<div class="kp-field">
				<label for="bl-room">Room</label>
				<select id="bl-room" name="room" required>
					{#each data.rooms as room (room.slug)}
						<option value={room.slug}>{room.name}</option>
					{/each}
				</select>
			</div>
			<div class="kp-field">
				<label for="bl-from">First night</label>
				<input id="bl-from" type="date" name="from" required min={data.today} />
			</div>
			<div class="kp-field">
				<label for="bl-to">Free again on</label>
				<input id="bl-to" type="date" name="to" required min={data.today} />
			</div>
		</div>
		<div class="kp-field">
			<label for="bl-reason">Why (optional)</label>
			<input id="bl-reason" type="text" name="reason" placeholder="Maintenance, family staying…" />
		</div>
		<button type="submit" class="kp-btn kp-btn--primary">Close these nights</button>
	</form>
</details>

{#if data.bookings.length === 0}
	<div class="kp-alert kp-alert--ok">Nothing here yet.</div>
{:else}
	<div style="overflow-x:auto;">
		<table class="kp-admin__table">
			<thead>
				<tr>
					<th>Reference</th>
					<th>Room</th>
					<th>Stay</th>
					<th>Guest</th>
					<th>Total</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each data.bookings as booking (booking.id)}
					<tr class:kp-admin__row--past={booking.check_out < data.today}>
						<td>
							<strong>{booking.reference}</strong>
							{#if booking.kind === 'block'}
								<span class="d-block kp-badge">blocked</span>
							{:else}
								<span class="d-block kp-badge">{booking.created_at}</span>
							{/if}
						</td>
						<td>{booking.room_name ?? booking.room_slug}</td>
						<td>
							<span class="d-block">{pretty(booking.check_in)}</span>
							<span class="d-block">→ {pretty(booking.check_out)}</span>
							<span class="d-block kp-badge">
								{booking.nights}
								{booking.nights === 1 ? 'night' : 'nights'}
							</span>
						</td>
						<td>
							{#if booking.kind === 'block'}
								<em>{booking.message || 'Closed off'}</em>
							{:else}
								<strong>{booking.guest_name}</strong>
								<span class="d-block"><a href="mailto:{booking.email}">{booking.email}</a></span>
								{#if booking.phone}
									<span class="d-block">
										<a href={whatsapp(booking)} target="_blank" rel="noopener">
											WhatsApp {booking.phone}
										</a>
									</span>
								{/if}
								<span class="d-block kp-badge">
									{booking.guests}
									{booking.guests === 1 ? 'guest' : 'guests'}
								</span>
								{#if booking.message}<span class="d-block">{booking.message}</span>{/if}
							{/if}
						</td>
						<td>
							{#if booking.kind === 'booking'}
								<strong>${booking.total_usd}</strong>
								<span class="d-block kp-badge">${booking.rate_usd}/night</span>
							{/if}
						</td>
						<td>
							<span class="d-block kp-badge">{booking.status}</span>
							{#if booking.kind === 'block'}
								<form method="POST" action="?/unblock" use:enhance>
									<input type="hidden" name="id" value={booking.id} />
									<button type="submit" class="kp-btn kp-btn--outline kp-btn--small">
										Reopen
									</button>
								</form>
							{:else}
								<form method="POST" action="?/status" use:enhance class="d-flex flex-wrap gap-1">
									<input type="hidden" name="id" value={booking.id} />
									{#if booking.status !== 'confirmed'}
										<button name="status" value="confirmed" class="kp-btn kp-btn--primary kp-btn--small">
											Confirm
										</button>
									{/if}
									{#if booking.status === 'pending'}
										<button name="status" value="declined" class="kp-btn kp-btn--outline kp-btn--small">
											Decline
										</button>
									{/if}
									{#if booking.status === 'confirmed'}
										<button name="status" value="cancelled" class="kp-btn kp-btn--outline kp-btn--small">
											Cancel
										</button>
									{/if}
								</form>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
