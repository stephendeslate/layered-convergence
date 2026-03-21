"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const invoice_service_js_1 = require("./invoice.service.js");
const mockPrisma = {
    invoice: {
        create: vitest_1.vi.fn(),
        findUnique: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
    },
};
const mockWorkOrderService = {
    transition: vitest_1.vi.fn(),
};
(0, vitest_1.describe)('InvoiceService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new invoice_service_js_1.InvoiceService(mockPrisma, mockWorkOrderService);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(service).toBeDefined();
    });
    (0, vitest_1.describe)('createFromWorkOrder', () => {
        (0, vitest_1.it)('should create invoice and transition work order to INVOICED', async () => {
            mockWorkOrderService.transition.mockResolvedValue({});
            mockPrisma.invoice.create.mockResolvedValue({ id: 'i1', workOrderId: 'wo1', amount: 150 });
            const result = await service.createFromWorkOrder('wo1', 'c1', 150);
            (0, vitest_1.expect)(result.amount).toBe(150);
            (0, vitest_1.expect)(mockWorkOrderService.transition).toHaveBeenCalledWith('wo1', 'c1', 'INVOICED');
        });
        (0, vitest_1.it)('should pass correct amount', async () => {
            mockWorkOrderService.transition.mockResolvedValue({});
            mockPrisma.invoice.create.mockResolvedValue({ id: 'i1', amount: 250 });
            await service.createFromWorkOrder('wo1', 'c1', 250);
            (0, vitest_1.expect)(mockPrisma.invoice.create).toHaveBeenCalledWith({
                data: { workOrderId: 'wo1', amount: 250 },
            });
        });
    });
    (0, vitest_1.describe)('markPaid', () => {
        (0, vitest_1.it)('should mark invoice as paid and transition work order', async () => {
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'i1', workOrderId: 'wo1', workOrder: { companyId: 'c1' },
            });
            mockWorkOrderService.transition.mockResolvedValue({});
            mockPrisma.invoice.update.mockResolvedValue({ id: 'i1', status: 'PAID' });
            const result = await service.markPaid('i1', 'c1');
            (0, vitest_1.expect)(result.status).toBe('PAID');
            (0, vitest_1.expect)(mockWorkOrderService.transition).toHaveBeenCalledWith('wo1', 'c1', 'PAID');
        });
        (0, vitest_1.it)('should throw NotFoundException when invoice not found', async () => {
            mockPrisma.invoice.findUnique.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.markPaid('999', 'c1')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    (0, vitest_1.describe)('findAllByCompany', () => {
        (0, vitest_1.it)('should return invoices scoped to company', async () => {
            mockPrisma.invoice.findMany.mockResolvedValue([{ id: 'i1' }]);
            const result = await service.findAllByCompany('c1');
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
        (0, vitest_1.it)('should filter by company through work order relation', async () => {
            mockPrisma.invoice.findMany.mockResolvedValue([]);
            await service.findAllByCompany('c1');
            (0, vitest_1.expect)(mockPrisma.invoice.findMany).toHaveBeenCalledWith({
                where: { workOrder: { companyId: 'c1' } },
                include: { workOrder: true },
            });
        });
    });
});
//# sourceMappingURL=invoice.service.spec.js.map