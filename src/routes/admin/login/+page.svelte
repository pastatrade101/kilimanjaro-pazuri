<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let showPassword = $state(false);
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Sign in · Kilimanjaro Pazuri</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="kp-login">
	<!-- The villa itself, so the door you come in by looks like the house. -->
	<aside class="kp-login__aside" aria-hidden="true">
		<img src="/assets/images/villa/hero-garden-suite.jpg" alt="" />
		<div class="kp-login__aside__inner">
			<img
				class="kp-login__mark"
				src="/assets/images/villa/logo-light.svg"
				alt=""
				width="260"
				height="56"
			/>
			<p class="kp-login__tagline">Stay close to Kilimanjaro. Feel at home in Moshi.</p>
		</div>
	</aside>

	<main class="kp-login__panel">
		<div class="kp-login__form">
			<img
				class="kp-login__mark kp-login__mark--small"
				src="/assets/images/villa/logo-dark.svg"
				alt="Kilimanjaro Pazuri"
				width="240"
				height="52"
			/>

			<p class="kp-login__eyebrow">Villa administration</p>
			<h1 class="kp-login__title">Welcome back</h1>
			<p class="kp-login__blurb">
				Sign in to read enquiries and to change the words and photographs on the site.
			</p>

			{#if form?.error}
				<div class="kp-alert kp-alert--bad" role="alert">{form.error}</div>
			{/if}

			<form
				method="POST"
				class="kp-form"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}
			>
				<div class="kp-field">
					<label for="username">Username</label>
					<input
						id="username"
						type="text"
						name="username"
						autocomplete="username"
						autocapitalize="none"
						spellcheck="false"
						required
					/>
				</div>

				<div class="kp-field">
					<label for="password">Password</label>
					<div class="kp-password">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							name="password"
							autocomplete="current-password"
							required
						/>
						<button
							type="button"
							class="kp-password__toggle"
							aria-pressed={showPassword}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<!-- Crossed through: the password is on screen. -->
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path
										d="M2 12s3.8-6.5 10-6.5c2 0 3.7.7 5.1 1.6M22 12s-3.8 6.5-10 6.5c-2.1 0-3.9-.8-5.3-1.7"
									/>
									<circle cx="12" cy="12" r="3" />
									<path d="M3 3l18 18" />
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
									<circle cx="12" cy="12" r="3" />
								</svg>
							{/if}
						</button>
					</div>
				</div>

				<button type="submit" class="kp-btn kp-btn--primary kp-login__submit" disabled={submitting}>
					{submitting ? 'Signing in…' : 'Sign in'}
				</button>
			</form>

			<p class="kp-login__back"><a href="/">Back to the villa</a></p>
		</div>
	</main>
</div>
