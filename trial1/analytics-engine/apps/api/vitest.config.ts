import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    setupFiles: ['./test/setup.ts'],
    fileParallelism: false,
  },
  plugins: [
    swc.vite({
      module: { type: 'nodenext' },
    }),
  ],
  resolve: {
    alias: {
      '@analytics-engine/shared': path.resolve(
        __dirname,
        '../../packages/shared/src',
      ),
    },
  },
});
