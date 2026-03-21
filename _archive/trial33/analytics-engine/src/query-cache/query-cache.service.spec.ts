import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { QueryCacheService } from './query-cache.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QueryCacheService', () => {
  let service: QueryCacheService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      queryCache: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        QueryCacheService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<QueryCacheService>(QueryCacheService);
  });

  describe('get', () => {
    it('should return null when cache miss', async () => {
      prisma.queryCache.findUnique.mockResolvedValue(null);
      const result = await service.get('hash-1');
      expect(result).toBeNull();
    });

    it('should return result when cache hit and not expired', async () => {
      const future = new Date(Date.now() + 60000);
      prisma.queryCache.findUnique.mockResolvedValue({
        queryHash: 'hash-1',
        result: { data: [1, 2, 3] },
        expiresAt: future,
      });

      const result = await service.get('hash-1');
      expect(result).toEqual({ data: [1, 2, 3] });
    });

    it('should return null and delete when expired', async () => {
      const past = new Date(Date.now() - 60000);
      prisma.queryCache.findUnique.mockResolvedValue({
        queryHash: 'hash-1',
        result: { data: [] },
        expiresAt: past,
      });

      const result = await service.get('hash-1');
      expect(result).toBeNull();
      expect(prisma.queryCache.delete).toHaveBeenCalledWith({ where: { queryHash: 'hash-1' } });
    });
  });

  describe('set', () => {
    it('should upsert cache entry', async () => {
      prisma.queryCache.upsert.mockResolvedValue({});
      await service.set('hash-1', { data: 'test' }, 300);
      expect(prisma.queryCache.upsert).toHaveBeenCalledWith({
        where: { queryHash: 'hash-1' },
        update: expect.objectContaining({ result: { data: 'test' } }),
        create: expect.objectContaining({
          queryHash: 'hash-1',
          result: { data: 'test' },
        }),
      });
    });
  });

  describe('invalidate', () => {
    it('should delete by queryHash', async () => {
      await service.invalidate('hash-1');
      expect(prisma.queryCache.deleteMany).toHaveBeenCalledWith({
        where: { queryHash: 'hash-1' },
      });
    });
  });

  describe('purgeExpired', () => {
    it('should delete expired entries', async () => {
      await service.purgeExpired();
      expect(prisma.queryCache.deleteMany).toHaveBeenCalledWith({
        where: { expiresAt: { lt: expect.any(Date) } },
      });
    });
  });
});
