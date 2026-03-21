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
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(service).toBeDefined();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a technician', async ()=>{
            mockPrisma.technician.create.mockResolvedValue({
                id: '1',
                name: 'Jane',
                email: 'jane@test.com'
            });
            const result = await service.create('comp-1', {
                name: 'Jane',
                email: 'jane@test.com'
            });
            (0, _vitest.expect)(result.name).toBe('Jane');
        });
        (0, _vitest.it)('should pass skills array', async ()=>{
            mockPrisma.technician.create.mockResolvedValue({
                id: '1'
            });
            await service.create('comp-1', {
                name: 'Tech',
                email: 'tech@test.com',
                skills: [
                    'HVAC',
                    'plumbing'
                ]
            });
            (0, _vitest.expect)(mockPrisma.technician.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    skills: [
                        'HVAC',
                        'plumbing'
                    ]
                })
            }));
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
        (0, _vitest.it)('should filter by status', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([]);
            await service.findAll('comp-1', 'AVAILABLE');
            (0, _vitest.expect)(mockPrisma.technician.findMany).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                where: {
                    companyId: 'comp-1',
                    status: 'AVAILABLE'
                }
            }));
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return a technician', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: '1',
                name: 'Jane'
            });
            const result = await service.findOne('comp-1', '1');
            (0, _vitest.expect)(result.name).toBe('Jane');
        });
        (0, _vitest.it)('should throw NotFoundException', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp-1', 'bad')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('updateLocation', ()=>{
        (0, _vitest.it)('should update lat/lng', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: '1'
            });
            mockPrisma.technician.update.mockResolvedValue({
                id: '1',
                currentLat: 40.0,
                currentLng: -74.0
            });
            const result = await service.updateLocation('comp-1', '1', 40.0, -74.0);
            (0, _vitest.expect)(result.currentLat).toBe(40.0);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete a technician', async ()=>{
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
});

//# sourceMappingURL=technicians.service.spec.js.map