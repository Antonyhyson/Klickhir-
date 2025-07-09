// svelte.config.js
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto is a good default for Cloudflare Pages, Vercel, Netlify etc.
		// If you're deploying to a Node.js server, you might use @sveltejs/adapter-node
		adapter: adapter(),

		// Configure path aliases here
		alias: {
			'$components': './src/components',
			'$lib': './src/lib' // This is usually there by default, but double-check
		}
	}
};

export default config;