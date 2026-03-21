"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _dashboardservice = require("./dashboard.service");
const mockPrisma = {
    dashboard: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
};
describe('DashboardService', ()=>{
    let service;
    beforeEach(()=>{
        service = new _dashboardservice.DashboardService(mockPrisma);
        vi.clearAllMocks();
    });
    describe('create', ()=>{
        it('should create a dashboard', async ()=>{
            const dto = {
                tenantId: 't1',
                name: 'Dashboard 1'
            };
            mockPrisma.dashboard.create.mockResolvedValue({
                id: '1',
                ...dto
            });
            const result = await service.create(dto);
            expect(result.name).toBe('Dashboard 1');
            expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
                data: dto
            });
        });
    });
    describe('findAll', ()=>{
        it('should return all dashboards', async ()=>{
            mockPrisma.dashboard.findMany.mockResolvedValue([]);
            const result = await service.findAll();
            expect(result).toEqual([]);
            expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
                where: undefined,
                include: {
                    widgets: true
                }
            });
        });
        it('should filter by tenantId', async ()=>{
            mockPrisma.dashboard.findMany.mockResolvedValue([]);
            await service.findAll('t1');
            expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
                where: {
                    tenantId: 't1'
                },
                include: {
                    widgets: true
                }
            });
        });
    });
    describe('findOne', ()=>{
        it('should return a dashboard with widgets and embedConfig', async ()=>{
            const dashboard = {
                id: '1',
                name: 'D1',
                widgets: [],
                embedConfig: null
            };
            mockPrisma.dashboard.findUniqueOrThrow.mockResolvedValue(dashboard);
            const result = await service.findOne('1');
            expect(result).toEqual(dashboard);
            expect(mockPrisma.dashboard.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                    id: '1'
                },
                include: {
                    widgets: true,
                    embedConfig: true
                }
            });
        });
    });
    describe('update', ()=>{
        it('should update a dashboard', async ()=>{
            mockPrisma.dashboard.update.mockResolvedValue({
                id: '1',
                name: 'Updated'
            });
            const result = await service.update('1', {
                name: 'Updated'
            });
            expect(result.name).toBe('Updated');
        });
    });
    describe('publish', ()=>{
        it('should set isPublished to true', async ()=>{
            mockPrisma.dashboard.update.mockResolvedValue({
                id: '1',
                isPublished: true
            });
            const result = await service.publish('1');
            expect(result.isPublished).toBe(true);
            expect(mockPrisma.dashboard.update).toHaveBeenCalledWith({
                where: {
                    id: '1'
                },
                data: {
                    isPublished: true
                }
            });
        });
    });
    describe('unpublish', ()=>{
        it('should set isPublished to false', async ()=>{
            mockPrisma.dashboard.update.mockResolvedValue({
                id: '1',
                isPublished: false
            });
            const result = await service.unpublish('1');
            expect(result.isPublished).toBe(false);
            expect(mockPrisma.dashboard.update).toHaveBeenCalledWith({
                where: {
                    id: '1'
                },
                data: {
                    isPublished: false
                }
            });
        });
    });
    describe('remove', ()=>{
        it('should delete a dashboard', async ()=>{
            mockPrisma.dashboard.delete.mockResolvedValue({
                id: '1'
            });
            const result = await service.remove('1');
            expect(result.id).toBe('1');
        });
    });
});

//# sourceMappingURL=dashboard.service.spec.js.map