import { Test, TestingModule } from '@nestjs/testing';
import { QueryCacheService } from './query-cache.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  queryCache: {
    findFirst: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
};

describe('QueryCacheService', () => {
  let service: QueryCacheService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryCacheService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<QueryCacheService>(QueryCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return cached result when valid', async () => {
      const cached = { result: { data: [1, 2, 3] } };
      mockPrisma.queryCache.findFirst.mockResolvedValue(cached);

      const result = await service.get('hash-1');

      expect(result).toEqual({ data: [1, 2, 3] });
    });

    it('should return null when cache miss', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);

      const result = await service.get('hash-missing');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should upsert a cache entry', async () => {
      const result = { data: [1, 2, 3] };
      mockPrisma.queryCache.upsert.mockResolvedValue({
        id: '1',
        queryHash: 'hash-1',
        result,
      });

      const cached = await service.set('hash-1', result, 600);

      expect(cached).toBeDefined();
      expect(mockPrisma.queryCache.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { queryHash: 'hash-1' },
          create: expect.objectContaining({ queryHash: 'hash-1' }),
          update: expect.objectContaining({ result }),
        }),
      );
    });
  });

  describe('invalidate', () => {
    it('should delete a cache entry by hash', async () => {
      mockPrisma.queryCache.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.invalidate('hash-1');

      expect(result).toEqual({ count: 1 });
      expect(mockPrisma.queryCache.deleteMany).toHaveBeenCalledWith({
        where: { queryHash: 'hash-1' },
      });
    });
  });

  describe('invalidateExpired', () => {
    it('should delete expired cache entries', async () => {
      mockPrisma.queryCache.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.invalidateExpired();

      expect(result).toEqual({ count: 5 });
    });
  });
});
