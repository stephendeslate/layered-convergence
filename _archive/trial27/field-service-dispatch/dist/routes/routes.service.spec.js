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
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(service).toBeDefined();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a route', async ()=>{
            mockPrisma.route.create.mockResolvedValue({
                id: '1',
                waypoints: [
                    {
                        lat: 40.0,
                        lng: -74.0
                    }
                ]
            });
            const result = await service.create('comp-1', {
                technicianId: 'tech-1',
                date: '2025-01-15',
                waypoints: [
                    {
                        lat: 40.0,
                        lng: -74.0
                    }
                ]
            });
            (0, _vitest.expect)(result.id).toBe('1');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return routes for company', async ()=>{
            mockPrisma.route.findMany.mockResolvedValue([
                {
                    id: '1'
                }
            ]);
            const result = await service.findAll('comp-1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
        (0, _vitest.it)('should filter by technicianId', async ()=>{
            mockPrisma.route.findMany.mockResolvedValue([]);
            await service.findAll('comp-1', 'tech-1');
            (0, _vitest.expect)(mockPrisma.route.findMany).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                where: {
                    companyId: 'comp-1',
                    technicianId: 'tech-1'
                }
            }));
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return a route', async ()=>{
            mockPrisma.route.findFirst.mockResolvedValue({
                id: '1'
            });
            const result = await service.findOne('comp-1', '1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
        (0, _vitest.it)('should throw NotFoundException', async ()=>{
            mockPrisma.route.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp-1', 'bad')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('findByTechnicianAndDate', ()=>{
        (0, _vitest.it)('should find routes by technician and date', async ()=>{
            mockPrisma.route.findMany.mockResolvedValue([
                {
                    id: '1'
                }
            ]);
            const result = await service.findByTechnicianAndDate('comp-1', 'tech-1', '2025-01-15');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete a route', async ()=>{
            mockPrisma.route.findFirst.mockResolvedValue({
                id: '1'
            });
            mockPrisma.route.delete.mockResolvedValue({
                id: '1'
            });
            const result = await service.delete('comp-1', '1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
    });
});

//# sourceMappingURL=routes.service.spec.js.map