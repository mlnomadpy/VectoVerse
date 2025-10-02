import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['modules/**/*.js'],
      exclude: ['modules/**/*.backup.js', 'modules/**/*.old.js']
    }
  },
  resolve: {
    alias: {
      '@': new URL('./modules', import.meta.url).pathname
    }
  }
});
