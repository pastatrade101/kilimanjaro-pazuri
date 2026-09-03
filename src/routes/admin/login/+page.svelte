<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="row justify-content-center">
	<div class="col-lg-5">
		<div class="kp-rates">
			<div class="py-4">
				<h2 class="kp-amenity-group__title">Sign in</h2>

				{#if form?.error}
					<div class="kp-alert kp-alert--bad">{form.error}</div>
				{/if}

				<form method="POST" use:enhance class="form-one">
					<div class="form-one__group">
						<div class="form-one__control form-one__control--full">
							<input type="text" name="username" placeholder="Username" autocomplete="username" required />
						</div>
						<div class="form-one__control form-one__control--full">
							<input type="password" name="password" placeholder="Password" autocomplete="current-password" required />
						</div>
						<div class="form-one__control form-one__control--full">
							<button type="submit" class="zoomvilla-btn">
								Sign in<i class="icon-angle-small-right"></i>
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
