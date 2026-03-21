"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _datapointsservice = require("./data-points.service");
const _prismaservice = require("../prisma/prisma.service");
describe('DataPointsService', ()=>{
    let service;
    let prisma;
    const mockDataPoint = {
        id: 'dp-1',
        dataSourceId: 'ds-1',
        timestamp: new Date('2024-01-01'),
        dimensions: {
            page: '/home'
        },
        metrics: {
            views: 100
        }
    };
    beforeEach(async ()=>{
        prisma = {
            dataPoint: {
                create: vi.fn().mockResolvedValue(mockDataPoint),
                createMany: vi.fn().mockResolvedValue({
                    count: 3
                }),
                findMany: vi.fn().mockResolvedValue([
                    mockDataPoint
                ]),
                count: vi.fn().mockResolvedValue(10)
            }
        };
        const module = await _testing.Test.createTestingModule({
            providers: [
                _datapointsservice.DataPointsService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: prisma
                }
            ]
        }).compile();
        service = module.get(_datapointsservice.DataPointsService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    describe('create', ()=>{
        it('should create a data point', async ()=>{
            const result = await service.create({
                dataSourceId: 'ds-1',
                timestamp: '2024-01-01T00:00:00Z',
                dimensions: {
                    page: '/home'
                },
                metrics: {
                    views: 100
                }
            });
            expect(result).toEqual(mockDataPoint);
        });
    });
    describe('createMany', ()=>{
        it('should batch create data points', async ()=>{
            const result = await service.createMany([
                {
                    dataSourceId: 'ds-1',
                    timestamp: '2024-01-01T00:00:00Z',
                    dimensions: {},
                    metrics: {}
                },
                {
                    dataSourceId: 'ds-1',
                    timestamp: '2024-01-02T00:00:00Z',
                    dimensions: {},
                    metrics: {}
                },
                {
                    dataSourceId: 'ds-1',
                    timestamp: '2024-01-03T00:00:00Z',
                    dimensions: {},
                    metrics: {}
                }
            ]);
            expect(result.count).toBe(3);
        });
    });
    describe('findByDataSource', ()=>{
        it('should return data points for a data source', async ()=>{
            const result = await service.findByDataSource('ds-1');
            expect(result).toHaveLength(1);
        });
        it('should filter by date range when provided', async ()=>{
            const from = new Date('2024-01-01');
            const to = new Date('2024-01-31');
            await service.findByDataSource('ds-1', from, to);
            expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    dataSourceId: 'ds-1',
                    timestamp: {
                        gte: from,
                        lte: to
                    }
                })
            }));
        });
        it('should not include timestamp filter when no dates provided', async ()=>{
            await service.findByDataSource('ds-1');
            expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    dataSourceId: 'ds-1'
                }
            }));
        });
    });
    describe('countByDataSource', ()=>{
        it('should return count', async ()=>{
            const result = await service.countByDataSource('ds-1');
            expect(result).toBe(10);
        });
    });
});

//# sourceMappingURL=data-points.service.spec.js.map