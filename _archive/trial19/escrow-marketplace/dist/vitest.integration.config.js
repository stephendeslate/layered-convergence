"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unplugin_swc_1 = require("unplugin-swc");
const config_1 = require("vitest/config");
const path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        root: './',
        include: ['test/**/*.integration.spec.ts'],
        alias: {
            '@': path_1.default.resolve(__dirname, './src'),
        },
        testTimeout: 30000,
        hookTimeout: 30000,
        fileParallelism: false,
        pool: 'forks',
        poolOptions: {
            forks: { singleFork: true },
        },
    },
    plugins: [unplugin_swc_1.default.vite({ module: { type: 'es6' } })],
});
//# sourceMappingURL=vitest.integration.config.js.map