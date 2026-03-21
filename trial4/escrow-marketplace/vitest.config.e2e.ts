import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/api/test/**/*.e2e-spec.ts'],
    // Per v3.0 Section 5.10: E2E tests must NOT run in parallel
    // to prevent shared database state interference
    fileParallelism: false,
    testTimeout: 30000,
  },
});
