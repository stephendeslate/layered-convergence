"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const work_order_controller_js_1 = require("./work-order.controller.js");
const mockService = {
    create: vitest_1.vi.fn(),
    findAllByCompany: vitest_1.vi.fn(),
    findOne: vitest_1.vi.fn(),
    assign: vitest_1.vi.fn(),
    transition: vitest_1.vi.fn(),
    unassign: vitest_1.vi.fn(),
    enRoute: vitest_1.vi.fn(),
    onSite: vitest_1.vi.fn(),
    start: vitest_1.vi.fn(),
    complete: vitest_1.vi.fn(),
    returnToAssigned: vitest_1.vi.fn(),
    autoAssign: vitest_1.vi.fn(),
};
const mockReq = (companyId) => ({ headers: { 'x-company-id': companyId }, companyId });
(0, vitest_1.describe)('WorkOrderController', () => {
    let controller;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        controller = new work_order_controller_js_1.WorkOrderController(mockService);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(controller).toBeDefined();
    });
    (0, vitest_1.it)('should call create', async () => {
        const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix' };
        mockService.create.mockResolvedValue({ id: '1', ...dto });
        const result = await controller.create(dto);
        (0, vitest_1.expect)(result.id).toBe('1');
    });
    (0, vitest_1.it)('should call findAll with companyId', async () => {
        mockService.findAllByCompany.mockResolvedValue([]);
        await controller.findAll(mockReq('c1'));
        (0, vitest_1.expect)(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
    });
    (0, vitest_1.it)('should call findOne with id and companyId', async () => {
        mockService.findOne.mockResolvedValue({ id: '1' });
        await controller.findOne('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.findOne).toHaveBeenCalledWith('1', 'c1');
    });
    (0, vitest_1.it)('should call assign', async () => {
        mockService.assign.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
        await controller.assign('1', { technicianId: 't1' }, mockReq('c1'));
        (0, vitest_1.expect)(mockService.assign).toHaveBeenCalledWith('1', 'c1', 't1');
    });
    (0, vitest_1.it)('should call transition', async () => {
        mockService.transition.mockResolvedValue({ id: '1', status: 'EN_ROUTE' });
        await controller.transition('1', { status: 'EN_ROUTE' }, mockReq('c1'));
        (0, vitest_1.expect)(mockService.transition).toHaveBeenCalled();
    });
    (0, vitest_1.it)('should call unassign', async () => {
        mockService.unassign.mockResolvedValue({ id: '1' });
        await controller.unassign('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.unassign).toHaveBeenCalledWith('1', 'c1');
    });
    (0, vitest_1.it)('should call enRoute', async () => {
        mockService.enRoute.mockResolvedValue({ id: '1' });
        await controller.enRoute('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.enRoute).toHaveBeenCalledWith('1', 'c1');
    });
    (0, vitest_1.it)('should call onSite', async () => {
        mockService.onSite.mockResolvedValue({ id: '1' });
        await controller.onSite('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.onSite).toHaveBeenCalledWith('1', 'c1');
    });
    (0, vitest_1.it)('should call start', async () => {
        mockService.start.mockResolvedValue({ id: '1' });
        await controller.start('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.start).toHaveBeenCalledWith('1', 'c1');
    });
    (0, vitest_1.it)('should call complete', async () => {
        mockService.complete.mockResolvedValue({ id: '1' });
        await controller.complete('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.complete).toHaveBeenCalledWith('1', 'c1');
    });
    (0, vitest_1.it)('should call returnToAssigned', async () => {
        mockService.returnToAssigned.mockResolvedValue({ id: '1' });
        await controller.returnToAssigned('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.returnToAssigned).toHaveBeenCalledWith('1', 'c1');
    });
    (0, vitest_1.it)('should call autoAssign', async () => {
        mockService.autoAssign.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
        await controller.autoAssign('1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.autoAssign).toHaveBeenCalledWith('1', 'c1');
    });
});
//# sourceMappingURL=work-order.controller.spec.js.map