import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: [
      '__integration__/**/*.integration-spec.ts',
      'test/**/*.integration.spec.ts',
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
    },
  },
});
