<script>
	import { BUILD_ID, CACHE_BUSTER_CONFIG } from '$lib/build-cache-buster.js';
	
	// Force cache buster to be included in build
	console.log('Layout loaded with cache buster:', CACHE_BUSTER_CONFIG);
</script>

<slot />

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
</style>
