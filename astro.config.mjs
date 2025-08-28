// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"], // Will automatically detect more from locales folder
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false
    }
  },
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
            { label: 'Overview', link: '/en/index' },
            { label: 'Getting Started', link: '/en/getting-started' },
            { label: 'Quick Start', link: '/en/guides/quick-start' },
            { label: 'Docker Setup', link: '/en/guides/docker' },
            { label: 'Bouy Fleet Manager', link: '/en/guides/bouy' },
          ],
        },
        {
          label: 'API',
          items: [
            { label: 'Overview', link: '/en/api/overview' },
            { label: 'Full Documentation', link: '/en/api/documentation' },
            { label: 'Reference', link: '/en/reference/api' },
          ],
        },
        {
          label: 'Architecture',
          items: [
            { label: 'System Overview', link: '/en/architecture/overview' },
            { label: 'LLM Pipeline', link: '/en/architecture/llm-pipeline' },
            { label: 'Reconciler', link: '/en/architecture/reconciler' },
            { label: 'Validator', link: '/en/architecture/validator' },
            { label: 'HAARRRvest Publisher', link: '/en/architecture/haarrrvest-publisher' },
          ],
        },
        {
          label: 'Scrapers',
          items: [
            { label: 'Overview', link: '/en/scrapers/overview' },
            { label: 'Patterns', link: '/en/scrapers/patterns' },
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
            { label: 'Contributing Guide', link: '/en/guides/contributing' },
            { label: 'Security Policy', link: '/en/guides/security' },
            { label: 'Privacy Policy', link: '/en/guides/privacy' },
            { label: 'Troubleshooting', link: '/en/reference/troubleshooting' },
          ],
        },
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/For-The-Greater-Good/pantry-pirate-radio' },
      ],
    }),
  ],
});