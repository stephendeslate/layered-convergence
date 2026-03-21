"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const technician_controller_js_1 = require("./technician.controller.js");
const mockService = {
    create: vitest_1.vi.fn(),
    findAllByCompany: vitest_1.vi.fn(),
    findOne: vitest_1.vi.fn(),
    update: vitest_1.vi.fn(),
    updatePosition: vitest_1.vi.fn(),
    remove: vitest_1.vi.fn(),
};
const mockReq = (companyId) => ({ headers: { 'x-company-id': companyId }, companyId });
(0, vitest_1.describe)('TechnicianController', () => {
    let controller;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        controller = new technician_controller_js_1.TechnicianController(mockService);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(controller).toBeDefined();
    });
    (0, vitest_1.it)('should call create on service', async () => {
        const dto = { companyId: 'c1', name: 'Bob', email: 'b@t.com', skills: [] };
        mockService.create.mockResolvedValue({ id: '1', ...dto });
        const result = await controller.create(dto);
        (0, vitest_1.expect)(result.name).toBe('Bob');
    });
    (0, vitest_1.it)('should call findAll with companyId', async () => {
        mockService.findAllByCompany.mockResolvedValue([{ id: '1' }]);
        const result = await controller.findAll(mockReq('c1'));
        (0, vitest_1.expect)(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
        (0, vitest_1.expect)(result).toHaveLength(1);
    });
    (0, vitest_1.it)('should call findOne with id and companyId', async () => {
        mockService.findOne.mockResolvedValue({ id: '1' });
        await controller.findOne('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.findOne).toHaveBeenCalledWith('1', 'c1');
    });
    (0, vitest_1.it)('should call update with id, companyId, and dto', async () => {
        mockService.update.mockResolvedValue({ id: '1', name: 'New' });
        await controller.update('1', { name: 'New' }, mockReq('c1'));
        (0, vitest_1.expect)(mockService.update).toHaveBeenCalledWith('1', 'c1', { name: 'New' });
    });
    (0, vitest_1.it)('should call updatePosition', async () => {
        mockService.updatePosition.mockResolvedValue({ id: '1' });
        await controller.updatePosition('1', { lat: 40.7, lng: -74.0 }, mockReq('c1'));
        (0, vitest_1.expect)(mockService.updatePosition).toHaveBeenCalledWith('1', 'c1', 40.7, -74.0);
    });
    (0, vitest_1.it)('should call remove with id and companyId', async () => {
        mockService.remove.mockResolvedValue({ id: '1' });
        await controller.remove('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.remove).toHaveBeenCalledWith('1', 'c1');
    });
});
//# sourceMappingURL=technician.controller.spec.js.map