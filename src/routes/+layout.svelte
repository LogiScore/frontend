<script>
	import { BUILD_ID, CACHE_BUSTER_CONFIG } from '$lib/build-cache-buster.js';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import InactivityPrompt from '$lib/components/InactivityPrompt.svelte';
	
	// Force cache buster to be included in build
	console.log('Layout loaded with cache buster:', CACHE_BUSTER_CONFIG);
</script>

<Header />

<slot />

<Footer />

<InactivityPrompt />

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		min-height: 100vh;
	}

	:global(body) {
		display: flex;
		flex-direction: column;
	}

	:global(main) {
		flex: 1;
	}
</style>
