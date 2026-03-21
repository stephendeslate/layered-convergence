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
        delete: _vitest.vi.fn()
    }
};
(0, _vitest.describe)('RoutesService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
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
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a route', async ()=>{
            const dto = {
                technicianId: 'tech-1',
                date: '2024-01-15',
                waypoints: [
                    {
                        lat: 40,
                        lng: -74
                    }
                ]
            };
            mockPrisma.route.create.mockResolvedValue({
                id: '1',
                ...dto
            });
            const result = await service.create('comp-1', dto);
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
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return route when found', async ()=>{
            mockPrisma.route.findFirst.mockResolvedValue({
                id: '1'
            });
            const result = await service.findOne('comp-1', '1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            mockPrisma.route.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp-1', '1')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('findByTechnician', ()=>{
        (0, _vitest.it)('should return routes for technician', async ()=>{
            mockPrisma.route.findMany.mockResolvedValue([
                {
                    id: '1',
                    technicianId: 'tech-1'
                }
            ]);
            const result = await service.findByTechnician('comp-1', 'tech-1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete route', async ()=>{
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