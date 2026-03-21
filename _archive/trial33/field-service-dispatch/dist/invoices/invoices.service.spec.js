"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _invoicesservice = require("./invoices.service");
const _common = require("@nestjs/common");
(0, _vitest.describe)('InvoicesService', ()=>{
    let service;
    let prisma;
    (0, _vitest.beforeEach)(()=>{
        prisma = {
            invoice: {
                create: _vitest.vi.fn(),
                findMany: _vitest.vi.fn(),
                findUnique: _vitest.vi.fn(),
                update: _vitest.vi.fn(),
                delete: _vitest.vi.fn()
            }
        };
        service = new _invoicesservice.InvoicesService(prisma);
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create an invoice', async ()=>{
            const dto = {
                workOrderId: 'wo-1',
                amount: 150.0
            };
            prisma.invoice.create.mockResolvedValue({
                id: 'inv-1',
                status: 'DRAFT',
                ...dto
            });
            const result = await service.create(dto);
            (0, _vitest.expect)(result.status).toBe('DRAFT');
            (0, _vitest.expect)(prisma.invoice.create).toHaveBeenCalledWith({
                data: _vitest.expect.objectContaining({
                    workOrderId: 'wo-1',
                    amount: 150.0,
                    status: 'DRAFT'
                }),
                include: {
                    workOrder: true
                }
            });
        });
        (0, _vitest.it)('should use provided status', async ()=>{
            const dto = {
                workOrderId: 'wo-1',
                amount: 150.0,
                status: 'SENT'
            };
            prisma.invoice.create.mockResolvedValue({
                id: 'inv-1'
            });
            await service.create(dto);
            (0, _vitest.expect)(prisma.invoice.create).toHaveBeenCalledWith({
                data: _vitest.expect.objectContaining({
                    status: 'SENT'
                }),
                include: {
                    workOrder: true
                }
            });
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all invoices', async ()=>{
            prisma.invoice.findMany.mockResolvedValue([
                {
                    id: 'inv-1'
                }
            ]);
            const result = await service.findAll();
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return an invoice by id', async ()=>{
            prisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1'
            });
            const result = await service.findOne('inv-1');
            (0, _vitest.expect)(result.id).toBe('inv-1');
        });
        (0, _vitest.it)('should throw NotFoundException if not found', async ()=>{
            prisma.invoice.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('nope')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('findByWorkOrder', ()=>{
        (0, _vitest.it)('should return invoice for a work order', async ()=>{
            prisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1',
                workOrderId: 'wo-1'
            });
            const result = await service.findByWorkOrder('wo-1');
            (0, _vitest.expect)(result.workOrderId).toBe('wo-1');
        });
    });
    (0, _vitest.describe)('markPaid', ()=>{
        (0, _vitest.it)('should mark invoice as paid', async ()=>{
            prisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1'
            });
            prisma.invoice.update.mockResolvedValue({
                id: 'inv-1',
                status: 'PAID',
                stripePaymentIntentId: 'pi_123'
            });
            const result = await service.markPaid('inv-1', 'pi_123');
            (0, _vitest.expect)(result.status).toBe('PAID');
            (0, _vitest.expect)(result.stripePaymentIntentId).toBe('pi_123');
        });
        (0, _vitest.it)('should throw NotFoundException if invoice not found', async ()=>{
            prisma.invoice.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.markPaid('nope')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete an invoice', async ()=>{
            prisma.invoice.findUnique.mockResolvedValue({
                id: 'inv-1'
            });
            prisma.invoice.delete.mockResolvedValue({
                id: 'inv-1'
            });
            const result = await service.delete('inv-1');
            (0, _vitest.expect)(result.id).toBe('inv-1');
        });
    });
});

//# sourceMappingURL=invoices.service.spec.js.map