import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryCacheService } from './query-cache.service';

// Mock ioredis before import
vi.mock('ioredis', () => {
  const RedisMock = vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    quit: vi.fn(),
  }));
  return { Redis: RedisMock, default: RedisMock };
});

describe('QueryCacheService', () => {
  let service: QueryCacheService;
  let redisMock: {
    get: ReturnType<typeof vi.fn>;
    setex: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    keys: ReturnType<typeof vi.fn>;
    quit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = new QueryCacheService();
    // Access the private redis instance
    redisMock = (service as any).redis;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return null on cache miss', async () => {
    redisMock.get.mockResolvedValue(null);
    const result = await service.get('t-1', 'hash-1');
    expect(result).toBeNull();
    expect(redisMock.get).toHaveBeenCalledWith('query_cache:t-1:hash-1');
  });

  it('should return parsed JSON on cache hit', async () => {
    redisMock.get.mockResolvedValue(JSON.stringify({ count: 42 }));
    const result = await service.get('t-1', 'hash-1');
    expect(result).toEqual({ count: 42 });
  });

  it('should set cache with default TTL', async () => {
    await service.set('t-1', 'hash-1', { count: 42 });
    expect(redisMock.setex).toHaveBeenCalledWith(
      'query_cache:t-1:hash-1',
      300,
      JSON.stringify({ count: 42 }),
    );
  });

  it('should set cache with custom TTL', async () => {
    await service.set('t-1', 'hash-1', { count: 42 }, 600);
    expect(redisMock.setex).toHaveBeenCalledWith(
      'query_cache:t-1:hash-1',
      600,
      JSON.stringify({ count: 42 }),
    );
  });

  it('should invalidate a single cache entry', async () => {
    await service.invalidate('t-1', 'hash-1');
    expect(redisMock.del).toHaveBeenCalledWith('query_cache:t-1:hash-1');
  });

  it('should invalidate all cache entries for a tenant', async () => {
    redisMock.keys.mockResolvedValue(['query_cache:t-1:a', 'query_cache:t-1:b']);
    await service.invalidateAll('t-1');
    expect(redisMock.keys).toHaveBeenCalledWith('query_cache:t-1:*');
    expect(redisMock.del).toHaveBeenCalledWith('query_cache:t-1:a', 'query_cache:t-1:b');
  });

  it('should not call del when no keys found for invalidateAll', async () => {
    redisMock.keys.mockResolvedValue([]);
    await service.invalidateAll('t-1');
    expect(redisMock.del).not.toHaveBeenCalled();
  });

  it('should quit redis on module destroy', async () => {
    await service.onModuleDestroy();
    expect(redisMock.quit).toHaveBeenCalled();
  });
});
