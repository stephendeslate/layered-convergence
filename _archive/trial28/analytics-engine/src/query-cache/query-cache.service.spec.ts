import { Test } from '@nestjs/testing';
import { QueryCacheService } from './query-cache.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  queryCache: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
};

describe('QueryCacheService', () => {
  let service: QueryCacheService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QueryCacheService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(QueryCacheService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateHash', () => {
    it('should generate a consistent SHA256 hash', () => {
      const hash1 = service.generateHash({ foo: 'bar' });
      const hash2 = service.generateHash({ foo: 'bar' });
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('should generate different hashes for different queries', () => {
      const hash1 = service.generateHash({ foo: 'bar' });
      const hash2 = service.generateHash({ foo: 'baz' });
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('get', () => {
    it('should return cached result if not expired', async () => {
      const future = new Date(Date.now() + 60000);
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: 'qc1',
        queryHash: 'hash1',
        result: { data: [1, 2, 3] },
        expiresAt: future,
      });

      const result = await service.get('hash1');
      expect(result).toEqual({ data: [1, 2, 3] });
    });

    it('should return null and delete if expired', async () => {
      const past = new Date(Date.now() - 60000);
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: 'qc1',
        queryHash: 'hash1',
        result: { data: [] },
        expiresAt: past,
      });
      mockPrisma.queryCache.delete.mockResolvedValue({});

      const result = await service.get('hash1');
      expect(result).toBeNull();
      expect(mockPrisma.queryCache.delete).toHaveBeenCalledWith({
        where: { id: 'qc1' },
      });
    });

    it('should return null if not found', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);

      const result = await service.get('missing');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should create a new cache entry', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);
      mockPrisma.queryCache.create.mockResolvedValue({
        id: 'qc1',
        queryHash: 'hash1',
        result: { data: [1] },
      });

      const result = await service.set('hash1', { data: [1] }, 300);
      expect(mockPrisma.queryCache.create).toHaveBeenCalledWith({
        data: {
          queryHash: 'hash1',
          result: { data: [1] },
          expiresAt: expect.any(Date),
        },
      });
      expect(result).toBeDefined();
    });

    it('should update an existing cache entry', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: 'qc1',
        queryHash: 'hash1',
      });
      mockPrisma.queryCache.update.mockResolvedValue({
        id: 'qc1',
        result: { data: [2] },
      });

      const result = await service.set('hash1', { data: [2] });
      expect(mockPrisma.queryCache.update).toHaveBeenCalledWith({
        where: { id: 'qc1' },
        data: { result: { data: [2] }, expiresAt: expect.any(Date) },
      });
      expect(result).toBeDefined();
    });
  });

  describe('invalidate', () => {
    it('should delete a cache entry by hash', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: 'qc1',
        queryHash: 'hash1',
      });
      mockPrisma.queryCache.delete.mockResolvedValue({});

      await service.invalidate('hash1');
      expect(mockPrisma.queryCache.delete).toHaveBeenCalledWith({
        where: { id: 'qc1' },
      });
    });

    it('should do nothing if hash not found', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);

      await service.invalidate('missing');
      expect(mockPrisma.queryCache.delete).not.toHaveBeenCalled();
    });
  });

  describe('invalidateAll', () => {
    it('should delete all cache entries', async () => {
      mockPrisma.queryCache.deleteMany.mockResolvedValue({ count: 5 });

      await service.invalidateAll();
      expect(mockPrisma.queryCache.deleteMany).toHaveBeenCalled();
    });
  });
});
