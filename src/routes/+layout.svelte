<script>
	import { BUILD_ID, CACHE_BUSTER_CONFIG } from '$lib/build-cache-buster.js';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import InactivityPrompt from '$lib/components/InactivityPrompt.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import { page } from '$app/stores';
	
	// Force cache buster to be included in build
	console.log('Layout loaded with cache buster:', CACHE_BUSTER_CONFIG);
	
	// Check if we're on an admin page
	$: isAdminPage = $page.url.pathname.includes('8x7k9m2p');
</script>

<Header hideSignUp={isAdminPage} hideNavigation={isAdminPage} />

<slot />

<Footer />

<InactivityPrompt />

<CookieConsent />

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
