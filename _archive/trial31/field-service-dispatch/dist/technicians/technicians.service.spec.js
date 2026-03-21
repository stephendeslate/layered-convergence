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
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a technician', async ()=>{
            const dto = {
                name: 'John',
                email: 'john@test.com'
            };
            mockPrisma.technician.create.mockResolvedValue({
                id: '1',
                ...dto
            });
            const result = await service.create('comp-1', dto);
            (0, _vitest.expect)(result.name).toBe('John');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return technicians for company', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([
                {
                    id: '1'
                }
            ]);
            const result = await service.findAll('comp-1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return technician when found', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: '1'
            });
            const result = await service.findOne('comp-1', '1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp-1', '1')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update technician', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: '1'
            });
            mockPrisma.technician.update.mockResolvedValue({
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
        (0, _vitest.it)('should delete technician', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: '1'
            });
            mockPrisma.technician.delete.mockResolvedValue({
                id: '1'
            });
            const result = await service.delete('comp-1', '1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
    });
    (0, _vitest.describe)('findAvailable', ()=>{
        (0, _vitest.it)('should return available technicians', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([
                {
                    id: '1',
                    status: 'AVAILABLE'
                }
            ]);
            const result = await service.findAvailable('comp-1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findNearest', ()=>{
        (0, _vitest.it)('should return nearest technician', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([
                {
                    id: '1',
                    currentLat: 40.1,
                    currentLng: -74.1
                },
                {
                    id: '2',
                    currentLat: 40.5,
                    currentLng: -74.5
                }
            ]);
            const result = await service.findNearest('comp-1', 40.0, -74.0);
            (0, _vitest.expect)(result?.id).toBe('1');
        });
        (0, _vitest.it)('should return null when no available technicians', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([]);
            const result = await service.findNearest('comp-1', 40.0, -74.0);
            (0, _vitest.expect)(result).toBeNull();
        });
    });
});

//# sourceMappingURL=technicians.service.spec.js.map