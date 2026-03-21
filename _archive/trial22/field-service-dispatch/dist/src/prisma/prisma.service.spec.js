"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { PoolSpy, PrismaPgSpy } = vitest_1.vi.hoisted(() => {
    const PoolSpy = vitest_1.vi.fn(function () { });
    const PrismaPgSpy = vitest_1.vi.fn(function () {
        return { provider: 'postgres', adapterName: '@prisma/adapter-pg' };
    });
    return { PoolSpy, PrismaPgSpy };
});
vitest_1.vi.mock('pg', () => ({ Pool: PoolSpy }));
vitest_1.vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: PrismaPgSpy }));
vitest_1.vi.mock('../../generated/prisma/client.js', () => {
    class MockPrismaClient {
        constructor(_opts) { }
        $connect = vitest_1.vi.fn();
        $disconnect = vitest_1.vi.fn();
    }
    return { PrismaClient: MockPrismaClient };
});
const prisma_service_js_1 = require("./prisma.service.js");
(0, vitest_1.describe)('PrismaService', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should be defined', () => {
        const service = new prisma_service_js_1.PrismaService();
        (0, vitest_1.expect)(service).toBeDefined();
    });
    (0, vitest_1.it)('should have $connect method', () => {
        const service = new prisma_service_js_1.PrismaService();
        (0, vitest_1.expect)(service.$connect).toBeDefined();
    });
    (0, vitest_1.it)('should have $disconnect method', () => {
        const service = new prisma_service_js_1.PrismaService();
        (0, vitest_1.expect)(service.$disconnect).toBeDefined();
    });
    (0, vitest_1.it)('should have onModuleInit method', () => {
        const service = new prisma_service_js_1.PrismaService();
        (0, vitest_1.expect)(service.onModuleInit).toBeDefined();
        (0, vitest_1.expect)(typeof service.onModuleInit).toBe('function');
    });
    (0, vitest_1.it)('should have onModuleDestroy method', () => {
        const service = new prisma_service_js_1.PrismaService();
        (0, vitest_1.expect)(service.onModuleDestroy).toBeDefined();
        (0, vitest_1.expect)(typeof service.onModuleDestroy).toBe('function');
    });
    (0, vitest_1.it)('should use Pool from pg in constructor', () => {
        new prisma_service_js_1.PrismaService();
        (0, vitest_1.expect)(PoolSpy).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ connectionString: vitest_1.expect.any(String) }));
    });
    (0, vitest_1.it)('should use PrismaPg adapter in constructor', () => {
        new prisma_service_js_1.PrismaService();
        (0, vitest_1.expect)(PrismaPgSpy).toHaveBeenCalled();
    });
});
//# sourceMappingURL=prisma.service.spec.js.map