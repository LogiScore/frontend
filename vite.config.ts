import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	
	// Optimize development experience
	server: {
		// Reduce source map errors
		sourcemapIgnoreList: (sourcePath) => {
			return sourcePath.includes('node_modules') || sourcePath.includes('.svelte-kit');
		}
	},
	
	// Build optimizations
	build: {
		sourcemap: false, // Disable source maps in production
		rollupOptions: {
			output: {
				// Optimize chunk splitting to reduce preload warnings
				manualChunks: (id) => {
					// Group vendor libraries
					if (id.includes('node_modules')) {
						if (id.includes('svelte') || id.includes('@sveltejs')) {
							return 'svelte-vendor';
						}
						if (id.includes('stripe') || id.includes('@stripe')) {
							return 'stripe-vendor';
						}
						return 'vendor';
					}
					
					// Group auth-related modules
					if (id.includes('$lib/auth') || id.includes('AuthModal') || id.includes('AdminLoginForm')) {
						return 'auth';
					}
					
					// Group subscription-related modules
					if (id.includes('Subscription') || id.includes('Payment') || id.includes('stripe')) {
						return 'subscription';
					}
					
					// Group API-related modules
					if (id.includes('$lib/api') || id.includes('api.ts')) {
						return 'api';
					}
				}
			}
		}
	},
	
	// Reduce console noise in development
	logLevel: 'warn'
});
