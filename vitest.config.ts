import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000' },
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/context/**', 'src/api.ts', 'server/routes/**'],
      exclude: ['src/test/**'],
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
