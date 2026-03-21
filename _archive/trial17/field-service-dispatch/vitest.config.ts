import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.integration-spec.ts'],
  },
  plugins: [swc.vite({ tsconfigFile: './tsconfig.json' })],
});
