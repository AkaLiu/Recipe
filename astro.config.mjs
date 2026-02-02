import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://akaliu.github.io',
  base: '/Recipe',
  integrations: [tailwind(), mdx()],
  output: 'static',
});
