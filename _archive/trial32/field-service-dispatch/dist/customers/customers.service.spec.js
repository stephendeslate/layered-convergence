"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _customersservice = require("./customers.service");
const _prismaservice = require("../prisma/prisma.service");
const mockPrisma = {
    customer: {
        create: _vitest.vi.fn(),
        findMany: _vitest.vi.fn(),
        findFirst: _vitest.vi.fn(),
        update: _vitest.vi.fn(),
        delete: _vitest.vi.fn()
    }
};
(0, _vitest.describe)('CustomersService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _customersservice.CustomersService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_customersservice.CustomersService);
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a customer', async ()=>{
            const dto = {
                name: 'Jane',
                address: '123 Main St'
            };
            mockPrisma.customer.create.mockResolvedValue({
                id: '1',
                ...dto
            });
            const result = await service.create('comp-1', dto);
            (0, _vitest.expect)(result.name).toBe('Jane');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return customers for company', async ()=>{
            mockPrisma.customer.findMany.mockResolvedValue([
                {
                    id: '1'
                }
            ]);
            const result = await service.findAll('comp-1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return customer when found', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: '1'
            });
            const result = await service.findOne('comp-1', '1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp-1', '1')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update customer', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: '1'
            });
            mockPrisma.customer.update.mockResolvedValue({
                id: '1',
                name: 'Updated'
            });
            const result = await service.update('comp-1', '1', {
                name: 'Updated'
            });
            (0, _vitest.expect)(result.name).toBe('Updated');
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete customer', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: '1'
            });
            mockPrisma.customer.delete.mockResolvedValue({
                id: '1'
            });
            const result = await service.delete('comp-1', '1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
    });
});

//# sourceMappingURL=customers.service.spec.js.map