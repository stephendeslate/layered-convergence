"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _invoicesservice = require("./invoices.service");
const _prismaservice = require("../prisma/prisma.service");
const mockPrisma = {
    invoice: {
        create: _vitest.vi.fn(),
        findMany: _vitest.vi.fn(),
        findUnique: _vitest.vi.fn(),
        update: _vitest.vi.fn()
    },
    workOrder: {
        findFirst: _vitest.vi.fn(),
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
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(service).toBeDefined();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create an invoice for a completed work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1',
                status: 'COMPLETED',
                companyId: 'comp-1'
            });
            mockPrisma.invoice.create.mockResolvedValue({
                id: 'inv-1',
                amount: 250,
                status: 'DRAFT'
            });
            mockPrisma.workOrder.update.mockResolvedValue({});
            mockPrisma.workOrderStatusHistory.create.mockResolvedValue({});
            const result = await service.create('comp-1', {
                workOrderId: 'wo-1',
                amount: 250
            });
            (0, _vitest.expect)(result.amount).toBe(250);
        });
        (0, _vitest.it)('should throw NotFoundException for missing work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.create('comp-1', {
                workOrderId: 'bad',
                amount: 100
            })).rejects.toThrow(_common.NotFoundException);
        });
        (0, _vitest.it)('should throw BadRequestException for non-completed work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1',
                status: 'ASSIGNED'
            });
            await (0, _vitest.expect)(service.create('comp-1', {
                workOrderId: 'wo-1',
                amount: 100
            })).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return invoices for company', async ()=>{
            mockPrisma.invoice.findMany.mockResolvedValue([
                {
                    id: 'inv-1'
                }
            ]);
            const result = await service.findAll('comp-1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return an invoice', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1'
            });
            const result = await service.findOne('inv-1');
            (0, _vitest.expect)(result.id).toBe('inv-1');
        });
        (0, _vitest.it)('should throw NotFoundException', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('bad')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('markAsSent', ()=>{
        (0, _vitest.it)('should mark a draft invoice as sent', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1',
                status: 'DRAFT'
            });
            mockPrisma.invoice.update.mockResolvedValue({
                id: 'inv-1',
                status: 'SENT'
            });
            const result = await service.markAsSent('inv-1');
            (0, _vitest.expect)(result.status).toBe('SENT');
        });
        (0, _vitest.it)('should throw BadRequestException for non-draft invoice', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1',
                status: 'PAID'
            });
            await (0, _vitest.expect)(service.markAsSent('inv-1')).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('markAsPaid', ()=>{
        (0, _vitest.it)('should mark a sent invoice as paid', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1',
                status: 'SENT',
                workOrderId: 'wo-1'
            });
            mockPrisma.$transaction.mockResolvedValue([
                {
                    id: 'inv-1',
                    status: 'PAID'
                },
                {},
                {}
            ]);
            const result = await service.markAsPaid('inv-1');
            (0, _vitest.expect)(result.status).toBe('PAID');
        });
    });
    (0, _vitest.describe)('voidInvoice', ()=>{
        (0, _vitest.it)('should void a draft invoice', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1',
                status: 'DRAFT'
            });
            mockPrisma.invoice.update.mockResolvedValue({
                id: 'inv-1',
                status: 'VOID'
            });
            const result = await service.voidInvoice('inv-1');
            (0, _vitest.expect)(result.status).toBe('VOID');
        });
        (0, _vitest.it)('should throw BadRequestException for paid invoice', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1',
                status: 'PAID'
            });
            await (0, _vitest.expect)(service.voidInvoice('inv-1')).rejects.toThrow(_common.BadRequestException);
        });
    });
});

//# sourceMappingURL=invoices.service.spec.js.map