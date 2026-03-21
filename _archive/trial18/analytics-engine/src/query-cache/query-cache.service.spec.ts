import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryCacheService } from './query-cache.service';

vi.mock('ioredis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue([]),
    quit: vi.fn().mockResolvedValue('OK'),
  })),
}));

describe('QueryCacheService', () => {
  let service: QueryCacheService;

  beforeEach(() => {
    service = new QueryCacheService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return null for cache miss', async () => {
    const result = await service.get('tenant-1', 'hash-1');
    expect(result).toBeNull();
  });

  it('should return parsed result for cache hit', async () => {
    const cached = { data: [1, 2, 3] };
    const redis = (service as any).redis;
    redis.get.mockResolvedValue(JSON.stringify(cached));

    const result = await service.get('tenant-1', 'hash-1');
    expect(result).toEqual(cached);
  });

  it('should set cache with default TTL', async () => {
    await service.set('tenant-1', 'hash-1', { data: 'test' });
    const redis = (service as any).redis;
    expect(redis.setex).toHaveBeenCalledWith(
      'query_cache:tenant-1:hash-1',
      300,
      JSON.stringify({ data: 'test' }),
    );
  });

  it('should set cache with custom TTL', async () => {
    await service.set('tenant-1', 'hash-1', { data: 'test' }, 60);
    const redis = (service as any).redis;
    expect(redis.setex).toHaveBeenCalledWith(
      'query_cache:tenant-1:hash-1',
      60,
      expect.any(String),
    );
  });

  it('should invalidate a specific cache entry', async () => {
    await service.invalidate('tenant-1', 'hash-1');
    const redis = (service as any).redis;
    expect(redis.del).toHaveBeenCalledWith('query_cache:tenant-1:hash-1');
  });

  it('should invalidate all cache entries for a tenant', async () => {
    const redis = (service as any).redis;
    redis.keys.mockResolvedValue(['query_cache:tenant-1:hash-1', 'query_cache:tenant-1:hash-2']);

    await service.invalidateAll('tenant-1');
    expect(redis.keys).toHaveBeenCalledWith('query_cache:tenant-1:*');
    expect(redis.del).toHaveBeenCalledWith(
      'query_cache:tenant-1:hash-1',
      'query_cache:tenant-1:hash-2',
    );
  });

  it('should not call del when no keys to invalidate', async () => {
    const redis = (service as any).redis;
    redis.keys.mockResolvedValue([]);
    redis.del.mockClear();

    await service.invalidateAll('tenant-1');
    expect(redis.del).not.toHaveBeenCalled();
  });

  it('should build correct cache key', () => {
    const key = (service as any).buildKey('tenant-1', 'hash-abc');
    expect(key).toBe('query_cache:tenant-1:hash-abc');
  });

  it('should have onModuleDestroy method', () => {
    expect(typeof service.onModuleDestroy).toBe('function');
  });
});
