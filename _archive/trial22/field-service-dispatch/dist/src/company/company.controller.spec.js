"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const company_controller_js_1 = require("./company.controller.js");
const mockService = {
    create: vitest_1.vi.fn(),
    findAll: vitest_1.vi.fn(),
    findOne: vitest_1.vi.fn(),
    update: vitest_1.vi.fn(),
    remove: vitest_1.vi.fn(),
};
(0, vitest_1.describe)('CompanyController', () => {
    let controller;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        controller = new company_controller_js_1.CompanyController(mockService);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(controller).toBeDefined();
    });
    (0, vitest_1.it)('should call create on service', async () => {
        const dto = { name: 'Test' };
        mockService.create.mockResolvedValue({ id: '1', ...dto });
        const result = await controller.create(dto);
        (0, vitest_1.expect)(result.name).toBe('Test');
    });
    (0, vitest_1.it)('should call findAll on service', async () => {
        mockService.findAll.mockResolvedValue([{ id: '1' }]);
        const result = await controller.findAll();
        (0, vitest_1.expect)(result).toHaveLength(1);
    });
    (0, vitest_1.it)('should call findOne on service', async () => {
        mockService.findOne.mockResolvedValue({ id: '1', name: 'Co' });
        const result = await controller.findOne('1');
        (0, vitest_1.expect)(result.id).toBe('1');
    });
    (0, vitest_1.it)('should call update on service', async () => {
        mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
        const result = await controller.update('1', { name: 'Updated' });
        (0, vitest_1.expect)(result.name).toBe('Updated');
    });
    (0, vitest_1.it)('should call remove on service', async () => {
        mockService.remove.mockResolvedValue({ id: '1' });
        const result = await controller.remove('1');
        (0, vitest_1.expect)(result.id).toBe('1');
    });
});
//# sourceMappingURL=company.controller.spec.js.map