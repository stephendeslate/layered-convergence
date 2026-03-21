import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    exclude: ['src/**/*.integration-spec.ts', 'node_modules'],
  },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
