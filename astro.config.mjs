// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Enables on-demand rendering for auth middleware
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    service: { entrypoint: 'astro/assets/services/noop' }
  }
});
