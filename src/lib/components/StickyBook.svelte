<script lang="ts">
	import { actions } from '$lib/content/site';
</script>

<!-- On mobile the WhatsApp button stays visible as a sticky action. -->
<a class="kp-sticky-book" href={actions.whatsapp.href} target="_blank" rel="noopener">
	<i class="fab fa-whatsapp"></i>
	{actions.whatsapp.label}
</a>
