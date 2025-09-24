// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	redirects: {
		'/': '/introduction',
	},
	integrations: [
		starlight({
			title: 'Statety',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/dvdbits/statety' }],
			sidebar: [
				// Top-level Introduction page
				{ label: 'Introduction', slug: 'introduction' },
				{ label: 'Motivation', slug: 'motivation' },
				{ label: 'Core Concepts', slug: 'core-concepts' },
				{
					label: 'API',
					items: [
						// API documentation items will go here
						{ label: 'create', slug: 'api/create' },
						{ label: 'derive', slug: 'api/derive' },
						{ label: 'compute', slug: 'api/compute' },
						{ label: 'read', slug: 'api/read' },
						{ label: 'set', slug: 'api/set' },
						{ label: 'subscribe', slug: 'api/subscribe' },
						{ label: 'delete', slug: 'api/delete' },
						{ label: 'useStatety', slug: 'api/usestatety' },
						{ label: 'useStatetyDerive', slug: 'api/usestatetyderive' },
						{ label: 'useStatetyCompute', slug: 'api/usestatetycompute' },
					],
				},
				{ label: 'Caveats', slug: 'caveats' },
				{ label: 'FAQ', slug: 'faq' },
			],
		}),
	],
});
