<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const filters = [
		{ key: null, label: 'Open' },
		{ key: 'new', label: 'New' },
		{ key: 'read', label: 'Read' },
		{ key: 'replied', label: 'Replied' },
		{ key: 'archived', label: 'Archived' }
	];

	function href(key: string | null) {
		return key ? `/admin?status=${key}` : '/admin';
	}

	function formatDate(value: string) {
		// SQLite stores UTC as "YYYY-MM-DD HH:MM:SS".
		return new Date(value.replace(' ', 'T') + 'Z').toLocaleString('en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}
</script>

<div class="row gutter-y-30 mb-4">
	{#each ['new', 'read', 'replied', 'archived'] as key (key)}
		<div class="col-6 col-lg-3">
			<div class="kp-rates text-center py-4">
				<span class="kp-room__price">{data.counts[key] ?? 0}</span>
				<span class="d-block kp-rate__summary text-capitalize">{key}</span>
			</div>
		</div>
	{/each}
</div>

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

{#if data.enquiries.length === 0}
	<div class="kp-alert kp-alert--ok">No enquiries here yet.</div>
{:else}
	<div style="overflow-x:auto;">
		<table class="kp-admin__table">
			<thead>
				<tr>
					<th>Received</th>
					<th>Guest</th>
					<th>Stay</th>
					<th>Message</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each data.enquiries as enquiry (enquiry.id)}
					<tr>
						<td>
							{formatDate(enquiry.created_at)}
							<span class="d-block kp-badge">{enquiry.kind}</span>
						</td>
						<td>
							<strong>{enquiry.name}</strong>
							<span class="d-block"><a href="mailto:{enquiry.email}">{enquiry.email}</a></span>
							{#if enquiry.phone}
								<span class="d-block"><a href="tel:{enquiry.phone}">{enquiry.phone}</a></span>
							{/if}
						</td>
						<td>
							{#if enquiry.room_slug}<span class="d-block text-capitalize">{enquiry.room_slug}</span>{/if}
							{#if enquiry.check_in}<span class="d-block">In {enquiry.check_in}</span>{/if}
							{#if enquiry.check_out}<span class="d-block">Out {enquiry.check_out}</span>{/if}
							{#if enquiry.guests}<span class="d-block">{enquiry.guests} guests</span>{/if}
						</td>
						<td style="max-width:340px;">{enquiry.message ?? '—'}</td>
						<td>
							<span class="kp-badge {enquiry.status === 'new' ? 'kp-badge--new' : ''}">
								{enquiry.status}
							</span>
							<form method="POST" action="?/status" use:enhance class="mt-2">
								<input type="hidden" name="id" value={enquiry.id} />
								<select name="status" onchange={(e) => e.currentTarget.form?.requestSubmit()}>
									<option value="new" selected={enquiry.status === 'new'}>New</option>
									<option value="read" selected={enquiry.status === 'read'}>Read</option>
									<option value="replied" selected={enquiry.status === 'replied'}>Replied</option>
									<option value="archived" selected={enquiry.status === 'archived'}>Archived</option>
								</select>
								<noscript><button type="submit" class="zoomvilla-btn mt-1">Save</button></noscript>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<!-- The copy is ready; these operational details are not. -->
<div class="mt-5">
	<h2 class="kp-amenity-group__title">Fourteen details to confirm before launch</h2>
	<p class="kp-form__note mb-3">
		Each one should be confirmed by the property owner before the website is published.
	</p>
	<ol class="kp-checklist">
		{#each data.checklist as item (item)}
			<li>{item}</li>
		{/each}
	</ol>
</div>
