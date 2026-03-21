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
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(service).toBeDefined();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a customer', async ()=>{
            mockPrisma.customer.create.mockResolvedValue({
                id: '1',
                name: 'John',
                address: '123 Main'
            });
            const result = await service.create('comp-1', {
                name: 'John',
                address: '123 Main'
            });
            (0, _vitest.expect)(result.name).toBe('John');
        });
        (0, _vitest.it)('should include lat/lng when provided', async ()=>{
            mockPrisma.customer.create.mockResolvedValue({
                id: '1'
            });
            await service.create('comp-1', {
                name: 'Jane',
                address: '456 Oak',
                lat: 40.0,
                lng: -74.0
            });
            (0, _vitest.expect)(mockPrisma.customer.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    lat: 40.0,
                    lng: -74.0
                })
            }));
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
        (0, _vitest.it)('should return a customer', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: '1',
                name: 'John'
            });
            const result = await service.findOne('comp-1', '1');
            (0, _vitest.expect)(result.name).toBe('John');
        });
        (0, _vitest.it)('should throw NotFoundException', async ()=>{
            mockPrisma.customer.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp-1', 'bad')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update a customer', async ()=>{
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
        (0, _vitest.it)('should delete a customer', async ()=>{
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