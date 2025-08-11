import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://vra-seniors.example.com',
  integrations: [
    tailwind(),
    sitemap()
  ],
  output: 'server',
  adapter: cloudflare(),
  image: {
    service: {
      entrypoint: 'astro/assets/services/compile'
    }
  },
  build: {
    assets: 'assets'
  }
});
