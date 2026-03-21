import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('ioredis', () => {
  const RedisMock = vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  }));
  return { default: RedisMock };
});

import { QueryCacheService } from './query-cache.service';

describe('QueryCacheService', () => {
  let service: QueryCacheService;

  beforeEach(() => {
    service = new QueryCacheService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateHash', () => {
    it('should generate a deterministic hash for query + params', () => {
      const hash1 = service.generateHash('SELECT *', { tenantId: 't1' });
      const hash2 = service.generateHash('SELECT *', { tenantId: 't1' });
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different queries', () => {
      const hash1 = service.generateHash('SELECT 1', {});
      const hash2 = service.generateHash('SELECT 2', {});
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different params', () => {
      const hash1 = service.generateHash('SELECT *', { a: 1 });
      const hash2 = service.generateHash('SELECT *', { a: 2 });
      expect(hash1).not.toBe(hash2);
    });

    it('should generate a 64-char hex string (sha256)', () => {
      const hash = service.generateHash('test', {});
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('get', () => {
    it('should return null when cache miss', async () => {
      const redis = (service as any).redis;
      redis.get.mockResolvedValue(null);
      const result = await service.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return parsed JSON when cache hit', async () => {
      const redis = (service as any).redis;
      redis.get.mockResolvedValue(JSON.stringify({ data: [1, 2, 3] }));
      const result = await service.get('somehash');
      expect(result).toEqual({ data: [1, 2, 3] });
    });
  });

  describe('set', () => {
    it('should store JSON with default TTL', async () => {
      const redis = (service as any).redis;
      redis.set.mockResolvedValue('OK');
      await service.set('hash1', { data: 'test' });
      expect(redis.set).toHaveBeenCalledWith('qc:hash1', '{"data":"test"}', 'EX', 300);
    });

    it('should store JSON with custom TTL', async () => {
      const redis = (service as any).redis;
      redis.set.mockResolvedValue('OK');
      await service.set('hash1', { data: 'test' }, 60);
      expect(redis.set).toHaveBeenCalledWith('qc:hash1', '{"data":"test"}', 'EX', 60);
    });
  });

  describe('invalidate', () => {
    it('should delete a cache entry', async () => {
      const redis = (service as any).redis;
      redis.del.mockResolvedValue(1);
      await service.invalidate('hash1');
      expect(redis.del).toHaveBeenCalledWith('qc:hash1');
    });
  });

  describe('invalidatePattern', () => {
    it('should delete matching keys', async () => {
      const redis = (service as any).redis;
      redis.keys.mockResolvedValue(['qc:abc', 'qc:def']);
      redis.del.mockResolvedValue(2);
      await service.invalidatePattern('*');
      expect(redis.del).toHaveBeenCalledWith('qc:abc', 'qc:def');
    });

    it('should not call del when no keys match', async () => {
      const redis = (service as any).redis;
      redis.keys.mockResolvedValue([]);
      await service.invalidatePattern('nonexistent*');
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('getOrSet', () => {
    it('should return cached value when available', async () => {
      const redis = (service as any).redis;
      redis.get.mockResolvedValue(JSON.stringify({ cached: true }));
      const fetcher = vi.fn();
      const result = await service.getOrSet('query', {}, fetcher);
      expect(result).toEqual({ cached: true });
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should call fetcher and cache result on miss', async () => {
      const redis = (service as any).redis;
      redis.get.mockResolvedValue(null);
      redis.set.mockResolvedValue('OK');
      const fetcher = vi.fn().mockResolvedValue({ fresh: true });
      const result = await service.getOrSet('query', {}, fetcher);
      expect(result).toEqual({ fresh: true });
      expect(fetcher).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
    });
  });
});
