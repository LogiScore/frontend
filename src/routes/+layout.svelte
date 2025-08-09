<script>
	import { BUILD_ID } from '$lib/build-cache-buster.js';
</script>

<slot />

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
</style>
