import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'test/**/*.integration-spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.service.ts', 'src/**/*.controller.ts', 'src/**/*.middleware.ts'],
      exclude: ['src/**/*.module.ts', 'src/**/*.dto.ts'],
    },
  },
});
