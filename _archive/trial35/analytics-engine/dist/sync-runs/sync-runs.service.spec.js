"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _syncrunsservice = require("./sync-runs.service");
const _prismaservice = require("../prisma/prisma.service");
describe('SyncRunsService', ()=>{
    let service;
    let prisma;
    const mockRun = {
        id: 'run-1',
        dataSourceId: 'ds-1',
        status: 'RUNNING',
        rowsIngested: 0,
        errorLog: null,
        startedAt: new Date(),
        completedAt: null
    };
    beforeEach(async ()=>{
        prisma = {
            syncRun: {
                create: vi.fn().mockResolvedValue(mockRun),
                findMany: vi.fn().mockResolvedValue([
                    mockRun
                ]),
                findUnique: vi.fn(),
                update: vi.fn()
            }
        };
        const module = await _testing.Test.createTestingModule({
            providers: [
                _syncrunsservice.SyncRunsService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: prisma
                }
            ]
        }).compile();
        service = module.get(_syncrunsservice.SyncRunsService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    describe('create', ()=>{
        it('should create a sync run with RUNNING status', async ()=>{
            const result = await service.create({
                dataSourceId: 'ds-1'
            });
            expect(result.status).toBe('RUNNING');
        });
    });
    describe('findByDataSource', ()=>{
        it('should return sync runs ordered by startedAt desc', async ()=>{
            const result = await service.findByDataSource('ds-1');
            expect(result).toHaveLength(1);
        });
    });
    describe('findById', ()=>{
        it('should return run when found', async ()=>{
            prisma.syncRun.findUnique.mockResolvedValue(mockRun);
            const result = await service.findById('run-1');
            expect(result.id).toBe('run-1');
        });
        it('should throw NotFoundException when not found', async ()=>{
            prisma.syncRun.findUnique.mockResolvedValue(null);
            await expect(service.findById('bad-id')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('complete', ()=>{
        it('should update status to COMPLETED with row count', async ()=>{
            prisma.syncRun.update.mockResolvedValue({
                ...mockRun,
                status: 'COMPLETED',
                rowsIngested: 42
            });
            const result = await service.complete('run-1', 42);
            expect(result.status).toBe('COMPLETED');
            expect(result.rowsIngested).toBe(42);
        });
    });
    describe('fail', ()=>{
        it('should update status to FAILED with error log', async ()=>{
            prisma.syncRun.update.mockResolvedValue({
                ...mockRun,
                status: 'FAILED',
                errorLog: 'Connection timeout'
            });
            const result = await service.fail('run-1', 'Connection timeout');
            expect(result.status).toBe('FAILED');
            expect(result.errorLog).toBe('Connection timeout');
        });
    });
});

//# sourceMappingURL=sync-runs.service.spec.js.map