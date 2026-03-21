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
        update: _vitest.vi.fn(),
        delete: _vitest.vi.fn()
    }
};
(0, _vitest.describe)('InvoicesService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
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
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create an invoice', async ()=>{
            const dto = {
                workOrderId: 'wo-1',
                amount: 100
            };
            mockPrisma.invoice.create.mockResolvedValue({
                id: '1',
                ...dto,
                status: 'DRAFT'
            });
            const result = await service.create(dto);
            (0, _vitest.expect)(result.amount).toBe(100);
            (0, _vitest.expect)(result.status).toBe('DRAFT');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all invoices', async ()=>{
            mockPrisma.invoice.findMany.mockResolvedValue([
                {
                    id: '1'
                }
            ]);
            const result = await service.findAll();
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return invoice when found', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: '1'
            });
            const result = await service.findOne('1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('1')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('findByWorkOrder', ()=>{
        (0, _vitest.it)('should return invoice for work order', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: '1',
                workOrderId: 'wo-1'
            });
            const result = await service.findByWorkOrder('wo-1');
            (0, _vitest.expect)(result?.workOrderId).toBe('wo-1');
        });
    });
    (0, _vitest.describe)('markPaid', ()=>{
        (0, _vitest.it)('should mark invoice as paid', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: '1'
            });
            mockPrisma.invoice.update.mockResolvedValue({
                id: '1',
                status: 'PAID'
            });
            const result = await service.markPaid('1', 'pi_123');
            (0, _vitest.expect)(result.status).toBe('PAID');
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete invoice', async ()=>{
            mockPrisma.invoice.findUnique.mockResolvedValue({
                id: '1'
            });
            mockPrisma.invoice.delete.mockResolvedValue({
                id: '1'
            });
            const result = await service.delete('1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
    });
});

//# sourceMappingURL=invoices.service.spec.js.map