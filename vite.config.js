import { defineConfig } from 'vite';

// Relative URLs work on both username.github.io and username.github.io/repository/.
export default defineConfig({
  base: './',
  server: { allowedHosts: ['terminal.local'] },
});
