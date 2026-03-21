"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _routesservice = require("./routes.service");
const _common = require("@nestjs/common");
(0, _vitest.describe)('RoutesService', ()=>{
    let service;
    let prisma;
    const companyId = 'company-1';
    (0, _vitest.beforeEach)(()=>{
        prisma = {
            route: {
                create: _vitest.vi.fn(),
                findMany: _vitest.vi.fn(),
                findFirst: _vitest.vi.fn(),
                delete: _vitest.vi.fn()
            }
        };
        service = new _routesservice.RoutesService(prisma);
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a route with companyId', async ()=>{
            const dto = {
                technicianId: 'tech-1',
                date: '2026-03-20',
                waypoints: [
                    {
                        lat: 40.0,
                        lng: -74.0
                    }
                ]
            };
            prisma.route.create.mockResolvedValue({
                id: 'route-1',
                companyId
            });
            const result = await service.create(companyId, dto);
            (0, _vitest.expect)(result.companyId).toBe(companyId);
            (0, _vitest.expect)(prisma.route.create).toHaveBeenCalledWith({
                data: _vitest.expect.objectContaining({
                    companyId,
                    technicianId: 'tech-1'
                }),
                include: {
                    technician: true
                }
            });
        });
        (0, _vitest.it)('should default optimizedOrder to empty array', async ()=>{
            const dto = {
                technicianId: 'tech-1',
                date: '2026-03-20',
                waypoints: []
            };
            prisma.route.create.mockResolvedValue({
                id: 'route-1'
            });
            await service.create(companyId, dto);
            (0, _vitest.expect)(prisma.route.create).toHaveBeenCalledWith({
                data: _vitest.expect.objectContaining({
                    optimizedOrder: []
                }),
                include: {
                    technician: true
                }
            });
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return routes filtered by companyId', async ()=>{
            prisma.route.findMany.mockResolvedValue([
                {
                    id: 'route-1'
                }
            ]);
            const result = await service.findAll(companyId);
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return a route by id and companyId', async ()=>{
            prisma.route.findFirst.mockResolvedValue({
                id: 'route-1'
            });
            const result = await service.findOne(companyId, 'route-1');
            (0, _vitest.expect)(result.id).toBe('route-1');
        });
        (0, _vitest.it)('should throw NotFoundException if not found', async ()=>{
            prisma.route.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne(companyId, 'nope')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('findByTechnician', ()=>{
        (0, _vitest.it)('should return routes for a technician', async ()=>{
            prisma.route.findMany.mockResolvedValue([
                {
                    id: 'route-1'
                }
            ]);
            const result = await service.findByTechnician(companyId, 'tech-1');
            (0, _vitest.expect)(result).toHaveLength(1);
            (0, _vitest.expect)(prisma.route.findMany).toHaveBeenCalledWith({
                where: {
                    companyId,
                    technicianId: 'tech-1'
                },
                include: {
                    technician: true
                },
                orderBy: {
                    date: 'desc'
                }
            });
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete a route', async ()=>{
            prisma.route.findFirst.mockResolvedValue({
                id: 'route-1'
            });
            prisma.route.delete.mockResolvedValue({
                id: 'route-1'
            });
            const result = await service.delete(companyId, 'route-1');
            (0, _vitest.expect)(result.id).toBe('route-1');
        });
    });
});

//# sourceMappingURL=routes.service.spec.js.map