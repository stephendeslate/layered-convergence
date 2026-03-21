"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _routesservice = require("./routes.service");
const _prismaservice = require("../prisma/prisma.service");
const mockPrisma = {
    route: {
        create: _vitest.vi.fn(),
        findMany: _vitest.vi.fn(),
        findFirst: _vitest.vi.fn(),
        update: _vitest.vi.fn(),
        delete: _vitest.vi.fn()
    }
};
(0, _vitest.describe)('RoutesService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
        const module = await _testing.Test.createTestingModule({
            providers: [
                _routesservice.RoutesService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_routesservice.RoutesService);
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a route', async ()=>{
            const dto = {
                technicianId: 't1',
                date: '2024-01-15',
                waypoints: [],
                estimatedDuration: 120
            };
            mockPrisma.route.create.mockResolvedValue({
                id: 'r1',
                ...dto
            });
            const result = await service.create('comp1', dto);
            (0, _vitest.expect)(result.id).toBe('r1');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all routes for company', async ()=>{
            mockPrisma.route.findMany.mockResolvedValue([
                {
                    id: 'r1'
                }
            ]);
            const result = await service.findAll('comp1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
        (0, _vitest.it)('should filter by technicianId', async ()=>{
            mockPrisma.route.findMany.mockResolvedValue([]);
            await service.findAll('comp1', 't1');
            (0, _vitest.expect)(mockPrisma.route.findMany).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                where: {
                    companyId: 'comp1',
                    technicianId: 't1'
                }
            }));
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return route when found', async ()=>{
            mockPrisma.route.findFirst.mockResolvedValue({
                id: 'r1'
            });
            const result = await service.findOne('comp1', 'r1');
            (0, _vitest.expect)(result.id).toBe('r1');
        });
        (0, _vitest.it)('should throw NotFoundException', async ()=>{
            mockPrisma.route.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp1', 'r999')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('findByTechnicianAndDate', ()=>{
        (0, _vitest.it)('should find routes for technician on date', async ()=>{
            mockPrisma.route.findMany.mockResolvedValue([
                {
                    id: 'r1'
                }
            ]);
            const result = await service.findByTechnicianAndDate('comp1', 't1', '2024-01-15');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update route', async ()=>{
            mockPrisma.route.findFirst.mockResolvedValue({
                id: 'r1'
            });
            mockPrisma.route.update.mockResolvedValue({
                id: 'r1',
                estimatedDuration: 90
            });
            const result = await service.update('comp1', 'r1', {
                estimatedDuration: 90
            });
            (0, _vitest.expect)(result.estimatedDuration).toBe(90);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete route', async ()=>{
            mockPrisma.route.findFirst.mockResolvedValue({
                id: 'r1'
            });
            mockPrisma.route.delete.mockResolvedValue({
                id: 'r1'
            });
            const result = await service.delete('comp1', 'r1');
            (0, _vitest.expect)(result.id).toBe('r1');
        });
    });
});

//# sourceMappingURL=routes.service.spec.js.map