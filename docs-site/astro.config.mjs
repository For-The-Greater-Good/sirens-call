// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'For The Greater Good Docs',
      customCss: [
        './src/styles/docs.css',
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Overview', link: '/' },
            { label: 'Getting Started', link: '/getting-started' },
            { label: 'Quick Start', link: '/guides/quick-start' },
            { label: 'Docker Setup', link: '/guides/docker' },
            { label: 'Bouy Fleet Manager', link: '/guides/bouy' },
          ],
        },
        {
          label: 'API',
          items: [
            { label: 'Overview', link: '/api/overview' },
            { label: 'Full Documentation', link: '/api/documentation' },
            { label: 'Reference', link: '/reference/api' },
          ],
        },
        {
          label: 'Architecture',
          items: [
            { label: 'System Overview', link: '/architecture/overview' },
            { label: 'LLM Pipeline', link: '/architecture/llm-pipeline' },
            { label: 'Reconciler', link: '/architecture/reconciler' },
            { label: 'Validator', link: '/architecture/validator' },
            { label: 'HAARRRvest Publisher', link: '/architecture/haarrrvest-publisher' },
          ],
        },
        {
          label: 'Scrapers',
          items: [
            { label: 'Overview', link: '/scrapers/overview' },
            { label: 'Patterns', link: '/scrapers/patterns' },
            {
              label: 'Active Scrapers',
              collapsed: true,
              autogenerate: { directory: 'scrapers/list' },
            },
          ],
        },
        {
          label: 'Contributing',
          items: [
            { label: 'Contributing Guide', link: '/guides/contributing' },
            { label: 'Security Policy', link: '/guides/security' },
            { label: 'Privacy Policy', link: '/guides/privacy' },
            { label: 'Troubleshooting', link: '/reference/troubleshooting' },
          ],
        },
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/For-The-Greater-Good/pantry-pirate-radio' },
      ],
      expressiveCode: {
        plugins: [pluginCollapsibleSections()],
      },
    }),
  ],
});