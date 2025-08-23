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
				manualChunks: undefined // Let Vite handle chunking
			}
		}
	},
	
	// Reduce console noise in development
	logLevel: 'warn'
});
