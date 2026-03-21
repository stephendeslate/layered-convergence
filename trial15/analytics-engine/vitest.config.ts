import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './src',
    include: ['**/*.spec.ts'],
    exclude: ['**/__integration__/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.dto.ts', '**/main.ts', '**/__integration__/**'],
    },
    setupFiles: [],
  },
});
