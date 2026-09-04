<script lang="ts">
	import { enhance } from '$app/forms';
	import Seo from '$lib/components/Seo.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const issues = $derived(form?.issues ?? {});
	const values = $derived(form?.values ?? {});

	const content = $derived(data.content);
	const images = $derived(content.images);
	const contact = $derived(content.contact);
	const site = $derived(content.site);
	const actions = $derived(content.actions);

	const heroStats = $derived([
		{ label: 'Booking', value: 'Direct with the villa' },
		{ label: 'Contact', value: 'WhatsApp, call or email' },
		{ label: 'Location', value: site.location }
	]);

	const heroActions = $derived([
		{ label: actions.whatsapp.label, href: actions.whatsapp.href, external: true },
		{ label: actions.call.label, href: actions.call.href }
	]);
</script>

<Seo title="Contact | {site.name} Moshi" description={contact.intro} />

<PageHeader
	title="Let’s plan your stay in Moshi"
	crumb="Contact"
	image={images.contactHeader}
	lead={contact.heroLead}
	stats={heroStats}
	statsLabel="Contact details"
	actions={heroActions}
/>

<section class="kp-contact-page section-space">
	<div class="container">
		<div class="kp-contact-layout">
			<aside class="kp-contact-direct wow fadeInUp" data-wow-duration="1200ms">
				<div class="kp-contact-direct__media">
					<img src={images.contactAside} alt="A prepared guest room at Kilimanjaro Pazuri" loading="lazy" />
					<div class="kp-contact-direct__place">
						<span>Find us in</span>
						<strong>{site.location}</strong>
					</div>
				</div>

				<div class="kp-contact-direct__body">
					<div class="kp-contact-direct__head">
						<span class="kp-contact-kicker">Direct contact</span>
						<h2>{contact.directTitle}</h2>
					</div>

					<div class="kp-contact-methods">
						<a href={actions.whatsapp.href} target="_blank" rel="noopener" class="kp-contact-method">
							<span class="kp-contact-method__icon" aria-hidden="true"><i class="fab fa-whatsapp"></i></span>
							<span class="kp-contact-method__copy">
								<span>WhatsApp</span>
								<strong>{site.phone}</strong>
							</span>
							<i class="icon-angle-small-right kp-contact-method__arrow" aria-hidden="true"></i>
						</a>

						<a href="mailto:{site.email}" class="kp-contact-method">
							<span class="kp-contact-method__icon" aria-hidden="true"><i class="far fa-envelope"></i></span>
							<span class="kp-contact-method__copy">
								<span>Email</span>
								<strong>{site.email}</strong>
							</span>
							<i class="icon-angle-small-right kp-contact-method__arrow" aria-hidden="true"></i>
						</a>

						<a href={actions.call.href} class="kp-contact-method">
							<span class="kp-contact-method__icon" aria-hidden="true"><i class="icon-phone-call"></i></span>
							<span class="kp-contact-method__copy">
								<span>Telephone</span>
								<strong>{site.phone}</strong>
							</span>
							<i class="icon-angle-small-right kp-contact-method__arrow" aria-hidden="true"></i>
						</a>
					</div>

					<div class="kp-contact-location">
						<span class="kp-contact-location__icon" aria-hidden="true"><i class="icon-pin"></i></span>
						<div>
							<span>Arrival information</span>
							<p>We will share the precise villa pin and directions when your stay is arranged.</p>
							<a href="/location">Explore the location <i class="icon-angle-small-right" aria-hidden="true"></i></a>
						</div>
					</div>
				</div>
			</aside>

			<div class="kp-contact-form wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="120ms">
				<div class="kp-contact-form__head">
					<span class="kp-contact-kicker">Stay enquiry</span>
					<h2>{contact.formTitle}</h2>
					<p>{contact.formIntro}</p>
				</div>

				{#if form?.success}
					<div class="kp-contact-success" role="status">
						<span class="kp-contact-success__icon" aria-hidden="true"><i class="icon-check-star"></i></span>
						<span class="kp-contact-kicker">Enquiry received</span>
						<h3>Thank you for getting in touch.</h3>
						<p>Your message has reached Kilimanjaro Pazuri. We will reply to the email address you provided.</p>
						<a href="/rooms" class="kp-btn kp-btn--primary">View rooms and rates</a>
					</div>
				{:else}
					{#if issues.form}
						<div class="kp-alert kp-alert--bad" role="alert">{issues.form}</div>
					{/if}

					<form method="POST" use:enhance class="kp-form">
						<fieldset class="kp-contact-form__group">
							<legend><span>01</span> Your details</legend>

							<div class="kp-field">
								<label for="c-name">Your name <span aria-hidden="true">*</span></label>
								<input
									id="c-name"
									type="text"
									name="name"
									autocomplete="name"
									required
									value={values.name ?? ''}
									aria-invalid={issues.name ? 'true' : undefined}
									aria-describedby={issues.name ? 'c-name-error' : undefined}
								/>
								{#if issues.name}<span class="kp-form__error" id="c-name-error">{issues.name}</span>{/if}
							</div>

							<div class="kp-field-row">
								<div class="kp-field">
									<label for="c-email">Your email <span aria-hidden="true">*</span></label>
									<input
										id="c-email"
										type="email"
										name="email"
										autocomplete="email"
										required
										value={values.email ?? ''}
										aria-invalid={issues.email ? 'true' : undefined}
										aria-describedby={issues.email ? 'c-email-error' : undefined}
									/>
									{#if issues.email}<span class="kp-form__error" id="c-email-error">{issues.email}</span>{/if}
								</div>
								<div class="kp-field">
									<label for="c-phone">Telephone or WhatsApp</label>
									<input
										id="c-phone"
										type="tel"
										name="phone"
										autocomplete="tel"
										value={values.phone ?? ''}
										aria-invalid={issues.phone ? 'true' : undefined}
										aria-describedby={issues.phone ? 'c-phone-error' : undefined}
									/>
									{#if issues.phone}<span class="kp-form__error" id="c-phone-error">{issues.phone}</span>{/if}
								</div>
							</div>
						</fieldset>

						<fieldset class="kp-contact-form__group">
							<legend><span>02</span> Stay details</legend>

							<div class="kp-field-row">
								<div class="kp-field">
									<label for="c-in">Arrival</label>
									<input
										id="c-in"
										type="date"
										name="check_in"
										value={values.check_in ?? ''}
										aria-invalid={issues.check_in ? 'true' : undefined}
										aria-describedby={issues.check_in ? 'c-in-error' : undefined}
									/>
									{#if issues.check_in}<span class="kp-form__error" id="c-in-error">{issues.check_in}</span>{/if}
								</div>
								<div class="kp-field">
									<label for="c-out">Departure</label>
									<input
										id="c-out"
										type="date"
										name="check_out"
										value={values.check_out ?? ''}
										aria-invalid={issues.check_out ? 'true' : undefined}
										aria-describedby={issues.check_out ? 'c-out-error' : undefined}
									/>
									{#if issues.check_out}<span class="kp-form__error" id="c-out-error">{issues.check_out}</span>{/if}
								</div>
							</div>

							<div class="kp-field-row">
								<div class="kp-field">
									<label for="c-room">Preferred room</label>
									<select
										id="c-room"
										name="room"
										aria-invalid={issues.room ? 'true' : undefined}
										aria-describedby={issues.room ? 'c-room-error' : undefined}
									>
										<option value="">Any room</option>
										{#each data.rooms as room (room.slug)}
											<option value={room.slug} selected={values.room === room.slug}>
												{room.name} — ${room.rate_usd}
											</option>
										{/each}
									</select>
									{#if issues.room}<span class="kp-form__error" id="c-room-error">{issues.room}</span>{/if}
								</div>
								<div class="kp-field">
									<label for="c-guests">Guests</label>
									<input
										id="c-guests"
										type="number"
										name="guests"
										min="1"
										max="20"
										inputmode="numeric"
										value={values.guests ?? ''}
										aria-invalid={issues.guests ? 'true' : undefined}
										aria-describedby={issues.guests ? 'c-guests-error' : undefined}
									/>
									{#if issues.guests}<span class="kp-form__error" id="c-guests-error">{issues.guests}</span>{/if}
								</div>
							</div>

							<div class="kp-field">
								<label for="c-message">Tell us about your stay <span aria-hidden="true">*</span></label>
								<textarea
									id="c-message"
									name="message"
									rows="5"
									required
									placeholder="Tell us about your plans, any questions or anything that would make your stay more comfortable."
									aria-invalid={issues.message ? 'true' : undefined}
									aria-describedby={issues.message ? 'c-message-error' : undefined}
								>{values.message ?? ''}</textarea>
								{#if issues.message}<span class="kp-form__error" id="c-message-error">{issues.message}</span>{/if}
							</div>
						</fieldset>

						<div class="kp-honeypot" aria-hidden="true">
							<label for="c-website">Leave this empty</label>
							<input type="text" id="c-website" name="website" tabindex="-1" autocomplete="off" />
						</div>

						<div class="kp-contact-form__submit">
							<button type="submit" class="kp-btn kp-btn--primary kp-contact-form__button">
								Send stay enquiry <i class="icon-angle-small-right" aria-hidden="true"></i>
							</button>
							<p>Submitting this form starts an enquiry; your reservation is confirmed separately.</p>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>

<section class="kp-contact-process section-space" aria-labelledby="contact-process-title">
	<div class="container">
		<div class="kp-contact-process__head">
			<span class="kp-contact-kicker">Three clear steps</span>
			<h2 id="contact-process-title">{contact.responseTitle}</h2>
			<p>{contact.responseIntro}</p>
		</div>

		<ol class="kp-contact-process__steps">
			{#each contact.responseSteps as step, i (step.title)}
				<li>
					<div class="kp-contact-process__marker">
						<span class="kp-contact-process__number">0{i + 1}</span>
						<span class="kp-contact-process__icon" aria-hidden="true"><i class={step.icon}></i></span>
					</div>
					<div class="kp-contact-process__copy">
						<h3>{step.title}</h3>
						<p>{step.text}</p>
					</div>
					{#if i < contact.responseSteps.length - 1}
						<span class="kp-contact-process__connector" aria-hidden="true"><i class="icon-angle-small-right"></i></span>
					{/if}
				</li>
			{/each}
		</ol>

		<div class="kp-contact-process__action">
			<div>
				<span>Prefer a quick conversation?</span>
				<strong>Message the villa directly on WhatsApp.</strong>
			</div>
			<a href={actions.whatsapp.href} class="kp-btn kp-btn--primary" target="_blank" rel="noopener">
				Start a WhatsApp chat <i class="fab fa-whatsapp" aria-hidden="true"></i>
			</a>
		</div>
	</div>
</section>
