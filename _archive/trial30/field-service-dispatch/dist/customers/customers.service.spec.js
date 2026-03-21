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
        _vitest.vi.clearAllMocks();
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
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a customer', async ()=>{
            const dto = {
                name: 'Alice',
                email: 'alice@test.com',
                address: '123 Main St'
            };
            mockPrisma.customer.create.mockResolvedValue({
                id: 'cust1',
                ...dto
            });
            const result = await service.create('comp1', dto);
            (0, _vitest.expect)(result.name).toBe('Alice');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all customers for company', async ()=>{
            mockPrisma.customer.findMany.mockResolvedValue([
                {
                    id: 'cust1'
                }
            ]);
            const result = await service.findAll('comp1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return customer when found', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: 'cust1'
            });
            const result = await service.findOne('comp1', 'cust1');
            (0, _vitest.expect)(result.id).toBe('cust1');
        });
        (0, _vitest.it)('should throw NotFoundException', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp1', 'cust999')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update customer', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: 'cust1'
            });
            mockPrisma.customer.update.mockResolvedValue({
                id: 'cust1',
                name: 'Bob'
            });
            const result = await service.update('comp1', 'cust1', {
                name: 'Bob'
            });
            (0, _vitest.expect)(result.name).toBe('Bob');
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete customer', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: 'cust1'
            });
            mockPrisma.customer.delete.mockResolvedValue({
                id: 'cust1'
            });
            const result = await service.delete('comp1', 'cust1');
            (0, _vitest.expect)(result.id).toBe('cust1');
        });
    });
});

//# sourceMappingURL=customers.service.spec.js.map