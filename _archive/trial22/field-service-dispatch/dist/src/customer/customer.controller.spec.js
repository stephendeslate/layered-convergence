"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const customer_controller_js_1 = require("./customer.controller.js");
const mockService = {
    create: vitest_1.vi.fn(),
    findAllByCompany: vitest_1.vi.fn(),
    findOne: vitest_1.vi.fn(),
    update: vitest_1.vi.fn(),
    remove: vitest_1.vi.fn(),
};
const mockReq = (companyId) => ({ headers: { 'x-company-id': companyId }, companyId });
(0, vitest_1.describe)('CustomerController', () => {
    let controller;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        controller = new customer_controller_js_1.CustomerController(mockService);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(controller).toBeDefined();
    });
    (0, vitest_1.it)('should call create', async () => {
        const dto = { companyId: 'c1', name: 'Jane', address: '1 St' };
        mockService.create.mockResolvedValue({ id: '1', ...dto });
        const result = await controller.create(dto);
        (0, vitest_1.expect)(result.name).toBe('Jane');
    });
    (0, vitest_1.it)('should call findAll with companyId', async () => {
        mockService.findAllByCompany.mockResolvedValue([{ id: '1' }]);
        const result = await controller.findAll(mockReq('c1'));
        (0, vitest_1.expect)(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
        (0, vitest_1.expect)(result).toHaveLength(1);
    });
    (0, vitest_1.it)('should call findOne', async () => {
        mockService.findOne.mockResolvedValue({ id: '1' });
        await controller.findOne('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.findOne).toHaveBeenCalledWith('1', 'c1');
    });
    (0, vitest_1.it)('should call update', async () => {
        mockService.update.mockResolvedValue({ id: '1' });
        await controller.update('1', { name: 'X' }, mockReq('c1'));
        (0, vitest_1.expect)(mockService.update).toHaveBeenCalledWith('1', 'c1', { name: 'X' });
    });
    (0, vitest_1.it)('should call remove', async () => {
        mockService.remove.mockResolvedValue({ id: '1' });
        await controller.remove('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.remove).toHaveBeenCalledWith('1', 'c1');
    });
});
//# sourceMappingURL=customer.controller.spec.js.map