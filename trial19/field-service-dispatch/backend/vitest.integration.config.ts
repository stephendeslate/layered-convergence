import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/integration/**/*.integration-spec.ts'],
    environment: 'node',
    testTimeout: 30000,
  },
});
