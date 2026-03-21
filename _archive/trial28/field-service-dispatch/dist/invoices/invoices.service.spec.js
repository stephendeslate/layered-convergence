"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _invoicesservice = require("./invoices.service");
const _prismaservice = require("../prisma/prisma.service");
const mockPrisma = {
    workOrder: {
        findFirst: _vitest.vi.fn(),
        update: _vitest.vi.fn()
    },
    invoice: {
        create: _vitest.vi.fn(),
        findMany: _vitest.vi.fn(),
        findUnique: _vitest.vi.fn(),
        update: _vitest.vi.fn()
    },
    workOrderStatusHistory: {
        create: _vitest.vi.fn()
    },
    $transaction: _vitest.vi.fn()
};
(0, _vitest.describe)('InvoicesService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
        const module = await _testing.Test.createTestingModule({
            providers: [
                _invoicesservice.InvoicesService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_invoicesservice.InvoicesService);
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create invoice for completed work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                status: _client.WorkOrderStatus.COMPLETED
            });
            mockPrisma.invoice.create.mockResolvedValue({
                id: 'inv1',
                amount: 100
            });
            mockPrisma.workOrder.update.mockResolvedValue({});
            mockPrisma.workOrderStatusHistory.create.mockResolvedValue({});
            const result = await service.create('comp1', {
                workOrderId: 'wo1',
                amount: 100
            });
            (0, _vitest.expect)(result.amount).toBe(100);
        });
        (0, _vitest.it)('should throw NotFoundException if work order not found', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.create('comp1', {
                workOrderId: 'wo999',
                amount: 100
            })).rejects.toThrow(_common.NotFoundException);
        });
        (0, _vitest.it)('should throw BadRequestException if work order not completed', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                status: _client.WorkOrderStatus.ASSIGNED
            });
            await (0, _vitest.expect)(service.create('comp1', {
                workOrderId: 'wo1',
                amount: 100
            })).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all invoices for company', async ()=>{
            mockPrisma.invoice.findMany.mockResolvedValue([
                {
                    id: 'inv1'
                }
            ]);
            const result = await service.findAll('comp1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return invoice when found', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv1'
            });
            const result = await service.findOne('inv1');
            (0, _vitest.expect)(result.id).toBe('inv1');
        });
        (0, _vitest.it)('should throw NotFoundException', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('inv999')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('markAsSent', ()=>{
        (0, _vitest.it)('should mark draft invoice as sent', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv1',
                status: _client.InvoiceStatus.DRAFT
            });
            mockPrisma.invoice.update.mockResolvedValue({
                id: 'inv1',
                status: _client.InvoiceStatus.SENT
            });
            const result = await service.markAsSent('inv1');
            (0, _vitest.expect)(result.status).toBe(_client.InvoiceStatus.SENT);
        });
        (0, _vitest.it)('should throw if invoice is not draft', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv1',
                status: _client.InvoiceStatus.PAID
            });
            await (0, _vitest.expect)(service.markAsSent('inv1')).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('markAsPaid', ()=>{
        (0, _vitest.it)('should mark sent invoice as paid', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv1',
                status: _client.InvoiceStatus.SENT,
                workOrderId: 'wo1'
            });
            mockPrisma.$transaction.mockResolvedValue([
                {
                    id: 'inv1',
                    status: _client.InvoiceStatus.PAID
                },
                {},
                {}
            ]);
            const result = await service.markAsPaid('inv1');
            (0, _vitest.expect)(result.status).toBe(_client.InvoiceStatus.PAID);
        });
        (0, _vitest.it)('should throw if invoice is already paid', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv1',
                status: _client.InvoiceStatus.PAID
            });
            await (0, _vitest.expect)(service.markAsPaid('inv1')).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('voidInvoice', ()=>{
        (0, _vitest.it)('should void a draft invoice', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv1',
                status: _client.InvoiceStatus.DRAFT
            });
            mockPrisma.invoice.update.mockResolvedValue({
                id: 'inv1',
                status: _client.InvoiceStatus.VOID
            });
            const result = await service.voidInvoice('inv1');
            (0, _vitest.expect)(result.status).toBe(_client.InvoiceStatus.VOID);
        });
        (0, _vitest.it)('should throw if invoice is paid', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv1',
                status: _client.InvoiceStatus.PAID
            });
            await (0, _vitest.expect)(service.voidInvoice('inv1')).rejects.toThrow(_common.BadRequestException);
        });
    });
});

//# sourceMappingURL=invoices.service.spec.js.map