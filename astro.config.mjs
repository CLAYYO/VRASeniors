import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://vra-seniors.example.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    tailwind(),
    sitemap()
  ],
  build: {
    assets: 'assets'
  }
});
