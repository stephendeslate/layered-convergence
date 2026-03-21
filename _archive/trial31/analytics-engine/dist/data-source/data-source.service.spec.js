"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _datasourceservice = require("./data-source.service");
const mockPrisma = {
    dataSource: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
};
describe('DataSourceService', ()=>{
    let service;
    beforeEach(()=>{
        service = new _datasourceservice.DataSourceService(mockPrisma);
        vi.clearAllMocks();
    });
    describe('create', ()=>{
        it('should create a data source', async ()=>{
            const dto = {
                tenantId: 't1',
                name: 'Source 1',
                type: 'webhook'
            };
            mockPrisma.dataSource.create.mockResolvedValue({
                id: '1',
                ...dto
            });
            const result = await service.create(dto);
            expect(result.name).toBe('Source 1');
        });
    });
    describe('findAll', ()=>{
        it('should return all data sources', async ()=>{
            mockPrisma.dataSource.findMany.mockResolvedValue([]);
            const result = await service.findAll();
            expect(result).toEqual([]);
        });
        it('should filter by tenantId', async ()=>{
            mockPrisma.dataSource.findMany.mockResolvedValue([]);
            await service.findAll('t1');
            expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith({
                where: {
                    tenantId: 't1'
                },
                include: {
                    dataSourceConfig: true
                }
            });
        });
    });
    describe('findOne', ()=>{
        it('should return a data source with config and sync runs', async ()=>{
            const ds = {
                id: '1',
                dataSourceConfig: null,
                syncRuns: []
            };
            mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue(ds);
            const result = await service.findOne('1');
            expect(result).toEqual(ds);
        });
    });
    describe('update with status transition', ()=>{
        it('should allow valid transition active -> paused', async ()=>{
            mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
                id: '1',
                status: 'active'
            });
            mockPrisma.dataSource.update.mockResolvedValue({
                id: '1',
                status: 'paused'
            });
            const result = await service.update('1', {
                status: 'paused'
            });
            expect(result.status).toBe('paused');
        });
        it('should allow valid transition active -> archived', async ()=>{
            mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
                id: '1',
                status: 'active'
            });
            mockPrisma.dataSource.update.mockResolvedValue({
                id: '1',
                status: 'archived'
            });
            const result = await service.update('1', {
                status: 'archived'
            });
            expect(result.status).toBe('archived');
        });
        it('should allow valid transition paused -> active', async ()=>{
            mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
                id: '1',
                status: 'paused'
            });
            mockPrisma.dataSource.update.mockResolvedValue({
                id: '1',
                status: 'active'
            });
            const result = await service.update('1', {
                status: 'active'
            });
            expect(result.status).toBe('active');
        });
        it('should reject invalid transition archived -> active', async ()=>{
            mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
                id: '1',
                status: 'archived'
            });
            await expect(service.update('1', {
                status: 'active'
            })).rejects.toThrow(_common.BadRequestException);
        });
        it('should reject invalid transition archived -> paused', async ()=>{
            mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
                id: '1',
                status: 'archived'
            });
            await expect(service.update('1', {
                status: 'paused'
            })).rejects.toThrow(_common.BadRequestException);
        });
        it('should allow update without status', async ()=>{
            mockPrisma.dataSource.update.mockResolvedValue({
                id: '1',
                name: 'Renamed'
            });
            const result = await service.update('1', {
                name: 'Renamed'
            });
            expect(result.name).toBe('Renamed');
            expect(mockPrisma.dataSource.findUniqueOrThrow).not.toHaveBeenCalled();
        });
    });
    describe('remove', ()=>{
        it('should delete a data source', async ()=>{
            mockPrisma.dataSource.delete.mockResolvedValue({
                id: '1'
            });
            await service.remove('1');
            expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({
                where: {
                    id: '1'
                }
            });
        });
    });
});

//# sourceMappingURL=data-source.service.spec.js.map