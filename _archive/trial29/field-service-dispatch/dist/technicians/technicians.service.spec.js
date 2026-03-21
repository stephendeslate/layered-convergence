"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _techniciansservice = require("./technicians.service");
const _prismaservice = require("../prisma/prisma.service");
const mockPrisma = {
    technician: {
        create: _vitest.vi.fn(),
        findMany: _vitest.vi.fn(),
        findFirst: _vitest.vi.fn(),
        update: _vitest.vi.fn(),
        delete: _vitest.vi.fn()
    }
};
(0, _vitest.describe)('TechniciansService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
        const module = await _testing.Test.createTestingModule({
            providers: [
                _techniciansservice.TechniciansService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_techniciansservice.TechniciansService);
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a technician', async ()=>{
            const dto = {
                name: 'John',
                email: 'john@test.com',
                phone: '555-1234'
            };
            mockPrisma.technician.create.mockResolvedValue({
                id: 't1',
                ...dto
            });
            const result = await service.create('comp1', dto);
            (0, _vitest.expect)(result.name).toBe('John');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all technicians for a company', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([
                {
                    id: 't1'
                }
            ]);
            const result = await service.findAll('comp1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
        (0, _vitest.it)('should filter by status', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([]);
            await service.findAll('comp1', 'AVAILABLE');
            (0, _vitest.expect)(mockPrisma.technician.findMany).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                where: {
                    companyId: 'comp1',
                    status: 'AVAILABLE'
                }
            }));
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return technician when found', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: 't1'
            });
            const result = await service.findOne('comp1', 't1');
            (0, _vitest.expect)(result.id).toBe('t1');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp1', 't999')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update technician', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: 't1'
            });
            mockPrisma.technician.update.mockResolvedValue({
                id: 't1',
                name: 'Jane'
            });
            const result = await service.update('comp1', 't1', {
                name: 'Jane'
            });
            (0, _vitest.expect)(result.name).toBe('Jane');
        });
    });
    (0, _vitest.describe)('updateLocation', ()=>{
        (0, _vitest.it)('should update technician location', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: 't1'
            });
            mockPrisma.technician.update.mockResolvedValue({
                id: 't1',
                currentLat: 40.7,
                currentLng: -74.0
            });
            const result = await service.updateLocation('comp1', 't1', 40.7, -74.0);
            (0, _vitest.expect)(result.currentLat).toBe(40.7);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete technician', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: 't1'
            });
            mockPrisma.technician.delete.mockResolvedValue({
                id: 't1'
            });
            const result = await service.delete('comp1', 't1');
            (0, _vitest.expect)(result.id).toBe('t1');
        });
    });
});

//# sourceMappingURL=technicians.service.spec.js.map