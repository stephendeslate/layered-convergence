"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _querycacheservice = require("./query-cache.service");
const _prismaservice = require("../prisma/prisma.service");
describe('QueryCacheService', ()=>{
    let service;
    let prisma;
    beforeEach(async ()=>{
        prisma = {
            queryCache: {
                findUnique: vi.fn(),
                upsert: vi.fn().mockResolvedValue({
                    id: 'qc-1'
                }),
                delete: vi.fn(),
                deleteMany: vi.fn()
            }
        };
        const module = await _testing.Test.createTestingModule({
            providers: [
                _querycacheservice.QueryCacheService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: prisma
                }
            ]
        }).compile();
        service = module.get(_querycacheservice.QueryCacheService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    describe('get', ()=>{
        it('should return null when not cached', async ()=>{
            prisma.queryCache.findUnique.mockResolvedValue(null);
            const result = await service.get('SELECT * FROM data');
            expect(result).toBeNull();
        });
        it('should return cached result when not expired', async ()=>{
            const future = new Date(Date.now() + 600000);
            prisma.queryCache.findUnique.mockResolvedValue({
                result: {
                    rows: []
                },
                expiresAt: future
            });
            const result = await service.get('SELECT * FROM data');
            expect(result).toEqual({
                rows: []
            });
        });
        it('should return null and delete when expired', async ()=>{
            const past = new Date(Date.now() - 1000);
            prisma.queryCache.findUnique.mockResolvedValue({
                result: {
                    rows: []
                },
                expiresAt: past
            });
            const result = await service.get('SELECT * FROM data');
            expect(result).toBeNull();
            expect(prisma.queryCache.delete).toHaveBeenCalled();
        });
    });
    describe('set', ()=>{
        it('should upsert cache entry', async ()=>{
            await service.set('query', {
                data: [
                    1,
                    2,
                    3
                ]
            }, 300);
            expect(prisma.queryCache.upsert).toHaveBeenCalled();
        });
    });
    describe('invalidate', ()=>{
        it('should delete cache entry', async ()=>{
            prisma.queryCache.delete.mockResolvedValue({});
            await service.invalidate('query');
            expect(prisma.queryCache.delete).toHaveBeenCalled();
        });
        it('should not throw if entry not found', async ()=>{
            prisma.queryCache.delete.mockRejectedValue(new Error('not found'));
            await expect(service.invalidate('query')).resolves.not.toThrow();
        });
    });
    describe('clearExpired', ()=>{
        it('should delete expired entries', async ()=>{
            await service.clearExpired();
            expect(prisma.queryCache.deleteMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    expiresAt: {
                        lt: expect.any(Date)
                    }
                }
            }));
        });
    });
});

//# sourceMappingURL=query-cache.service.spec.js.map