<script lang="ts">
	import { page } from '$app/state';

	const actions = $derived(page.data.content.actions);
</script>

<!-- On mobile the WhatsApp button stays visible as a sticky action. -->
<a class="kp-sticky-book" href={actions.whatsapp.href} target="_blank" rel="noopener">
	<i class="fab fa-whatsapp"></i>
	{actions.whatsapp.label}
</a>
