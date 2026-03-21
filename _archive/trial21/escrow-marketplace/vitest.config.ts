import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts', '**/*.integration-spec.ts'],
    setupFiles: [],
  },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
