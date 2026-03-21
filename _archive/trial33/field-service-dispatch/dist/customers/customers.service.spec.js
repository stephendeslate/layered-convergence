"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _customersservice = require("./customers.service");
const _common = require("@nestjs/common");
(0, _vitest.describe)('CustomersService', ()=>{
    let service;
    let prisma;
    const companyId = 'company-1';
    (0, _vitest.beforeEach)(()=>{
        prisma = {
            customer: {
                create: _vitest.vi.fn(),
                findMany: _vitest.vi.fn(),
                findFirst: _vitest.vi.fn(),
                update: _vitest.vi.fn(),
                delete: _vitest.vi.fn()
            }
        };
        service = new _customersservice.CustomersService(prisma);
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a customer with companyId', async ()=>{
            const dto = {
                name: 'John',
                address: '123 Main St'
            };
            prisma.customer.create.mockResolvedValue({
                id: 'cust-1',
                companyId,
                ...dto
            });
            const result = await service.create(companyId, dto);
            (0, _vitest.expect)(result.companyId).toBe(companyId);
            (0, _vitest.expect)(prisma.customer.create).toHaveBeenCalledWith({
                data: _vitest.expect.objectContaining({
                    companyId,
                    name: 'John'
                })
            });
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return customers filtered by companyId', async ()=>{
            prisma.customer.findMany.mockResolvedValue([
                {
                    id: 'cust-1'
                }
            ]);
            const result = await service.findAll(companyId);
            (0, _vitest.expect)(result).toHaveLength(1);
            (0, _vitest.expect)(prisma.customer.findMany).toHaveBeenCalledWith({
                where: {
                    companyId
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return a customer by id and companyId', async ()=>{
            prisma.customer.findFirst.mockResolvedValue({
                id: 'cust-1',
                companyId
            });
            const result = await service.findOne(companyId, 'cust-1');
            (0, _vitest.expect)(result.id).toBe('cust-1');
        });
        (0, _vitest.it)('should throw NotFoundException if not found', async ()=>{
            prisma.customer.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne(companyId, 'nope')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update a customer', async ()=>{
            prisma.customer.findFirst.mockResolvedValue({
                id: 'cust-1',
                companyId
            });
            prisma.customer.update.mockResolvedValue({
                id: 'cust-1',
                name: 'Updated'
            });
            const result = await service.update(companyId, 'cust-1', {
                name: 'Updated'
            });
            (0, _vitest.expect)(result.name).toBe('Updated');
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete a customer', async ()=>{
            prisma.customer.findFirst.mockResolvedValue({
                id: 'cust-1',
                companyId
            });
            prisma.customer.delete.mockResolvedValue({
                id: 'cust-1'
            });
            const result = await service.delete(companyId, 'cust-1');
            (0, _vitest.expect)(result.id).toBe('cust-1');
        });
    });
});

//# sourceMappingURL=customers.service.spec.js.map