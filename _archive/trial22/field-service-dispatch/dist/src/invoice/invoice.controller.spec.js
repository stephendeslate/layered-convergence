"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const invoice_controller_js_1 = require("./invoice.controller.js");
const mockService = {
    createFromWorkOrder: vitest_1.vi.fn(),
    markPaid: vitest_1.vi.fn(),
    findAllByCompany: vitest_1.vi.fn(),
};
const mockReq = (companyId) => ({ headers: { 'x-company-id': companyId }, companyId });
(0, vitest_1.describe)('InvoiceController', () => {
    let controller;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        controller = new invoice_controller_js_1.InvoiceController(mockService);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(controller).toBeDefined();
    });
    (0, vitest_1.it)('should call createFromWorkOrder', async () => {
        mockService.createFromWorkOrder.mockResolvedValue({ id: 'i1' });
        await controller.createFromWorkOrder('wo1', { amount: 100 }, mockReq('c1'));
        (0, vitest_1.expect)(mockService.createFromWorkOrder).toHaveBeenCalledWith('wo1', 'c1', 100);
    });
    (0, vitest_1.it)('should call markPaid', async () => {
        mockService.markPaid.mockResolvedValue({ id: 'i1', status: 'PAID' });
        await controller.markPaid('i1', mockReq('c1'));
        (0, vitest_1.expect)(mockService.markPaid).toHaveBeenCalledWith('i1', 'c1');
    });
    (0, vitest_1.it)('should call findAll', async () => {
        mockService.findAllByCompany.mockResolvedValue([]);
        await controller.findAll(mockReq('c1'));
        (0, vitest_1.expect)(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
    });
});
//# sourceMappingURL=invoice.controller.spec.js.map