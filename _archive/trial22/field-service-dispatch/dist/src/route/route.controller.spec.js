"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const route_controller_js_1 = require("./route.controller.js");
const mockService = {
    create: vitest_1.vi.fn(),
    findByTechnician: vitest_1.vi.fn(),
    optimize: vitest_1.vi.fn(),
};
(0, vitest_1.describe)('RouteController', () => {
    let controller;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        controller = new route_controller_js_1.RouteController(mockService);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(controller).toBeDefined();
    });
    (0, vitest_1.it)('should call create', async () => {
        const dto = { technicianId: 't1', date: '2024-01-01', waypoints: [] };
        mockService.create.mockResolvedValue({ id: '1' });
        const result = await controller.create(dto);
        (0, vitest_1.expect)(result.id).toBe('1');
    });
    (0, vitest_1.it)('should call findByTechnician', async () => {
        mockService.findByTechnician.mockResolvedValue([]);
        await controller.findByTechnician('t1');
        (0, vitest_1.expect)(mockService.findByTechnician).toHaveBeenCalledWith('t1');
    });
    (0, vitest_1.it)('should call optimize', async () => {
        mockService.optimize.mockResolvedValue({ id: '1', optimizedOrder: [] });
        await controller.optimize('1');
        (0, vitest_1.expect)(mockService.optimize).toHaveBeenCalledWith('1');
    });
});
//# sourceMappingURL=route.controller.spec.js.map