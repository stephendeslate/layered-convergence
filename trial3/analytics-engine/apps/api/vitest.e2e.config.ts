import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false, // [VERIFY:E2E_CONFIG] Shared DB — no parallel test files
    testTimeout: 30000, // E2E with real DB is slower
    include: ['test/**/*.e2e-spec.ts'],
    globals: true,
  },
});
