<script>
	import { BUILD_ID, CACHE_BUSTER_CONFIG } from '$lib/build-cache-buster.js';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { onMount } from 'svelte';
	
	// Force cache buster to be included in build
	console.log('Layout loaded with cache buster:', CACHE_BUSTER_CONFIG);
	
	// Check if we're on an admin page
	$: isAdminPage = $page.url.pathname.includes('8x7k9m2p');
	
	// Initialize Vercel Analytics
	injectAnalytics();
	
	// Lazy load components that aren't immediately needed
	let InactivityPrompt: any, CookieConsent: any;
	
	onMount(async () => {
		// Load these components after the initial page load to reduce preload warnings
		const [inactivityModule, cookieModule] = await Promise.all([
			import('$lib/components/InactivityPrompt.svelte'),
			import('$lib/components/CookieConsent.svelte')
		]);
		
		InactivityPrompt = inactivityModule.default;
		CookieConsent = cookieModule.default;
	});
</script>

<Header hideNavigation={isAdminPage} />

<slot />

{#if !isAdminPage}
  <Footer />
{/if}

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
