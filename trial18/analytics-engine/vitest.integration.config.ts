import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__integration__/**/*.integration-spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
