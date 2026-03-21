"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _dashboardsservice = require("./dashboards.service");
const _prismaservice = require("../prisma/prisma.service");
describe('DashboardsService', ()=>{
    let service;
    let prisma;
    const mockDashboard = {
        id: 'dash-1',
        tenantId: 'tenant-1',
        name: 'Test Dashboard',
        layout: null,
        isPublished: false,
        widgets: []
    };
    beforeEach(async ()=>{
        prisma = {
            dashboard: {
                create: vi.fn().mockResolvedValue(mockDashboard),
                findMany: vi.fn().mockResolvedValue([
                    mockDashboard
                ]),
                findUnique: vi.fn(),
                update: vi.fn().mockResolvedValue(mockDashboard),
                delete: vi.fn().mockResolvedValue(mockDashboard)
            }
        };
        const module = await _testing.Test.createTestingModule({
            providers: [
                _dashboardsservice.DashboardsService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: prisma
                }
            ]
        }).compile();
        service = module.get(_dashboardsservice.DashboardsService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    describe('create', ()=>{
        it('should create a dashboard', async ()=>{
            const result = await service.create({
                tenantId: 'tenant-1',
                name: 'Test Dashboard'
            });
            expect(result).toEqual(mockDashboard);
        });
        it('should default isPublished to false', async ()=>{
            await service.create({
                tenantId: 'tenant-1',
                name: 'Test'
            });
            expect(prisma.dashboard.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    isPublished: false
                })
            }));
        });
    });
    describe('findAll', ()=>{
        it('should return dashboards for a tenant', async ()=>{
            const result = await service.findAll('tenant-1');
            expect(result).toHaveLength(1);
            expect(prisma.dashboard.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    tenantId: 'tenant-1'
                }
            }));
        });
    });
    describe('findById', ()=>{
        it('should return dashboard when found', async ()=>{
            prisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
            const result = await service.findById('dash-1');
            expect(result.id).toBe('dash-1');
        });
        it('should throw NotFoundException when not found', async ()=>{
            prisma.dashboard.findUnique.mockResolvedValue(null);
            await expect(service.findById('bad-id')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('update', ()=>{
        it('should update dashboard', async ()=>{
            await service.update('dash-1', {
                name: 'Updated'
            });
            expect(prisma.dashboard.update).toHaveBeenCalledWith({
                where: {
                    id: 'dash-1'
                },
                data: {
                    name: 'Updated'
                }
            });
        });
    });
    describe('remove', ()=>{
        it('should delete dashboard', async ()=>{
            await service.remove('dash-1');
            expect(prisma.dashboard.delete).toHaveBeenCalledWith({
                where: {
                    id: 'dash-1'
                }
            });
        });
    });
});

//# sourceMappingURL=dashboards.service.spec.js.map