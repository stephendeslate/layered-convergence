import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryCacheService } from './query-cache.service';

vi.mock('ioredis', () => {
  const mockRedis = {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    quit: vi.fn(),
  };
  return { Redis: vi.fn(() => mockRedis), default: { Redis: vi.fn(() => mockRedis) } };
});

describe('QueryCacheService', () => {
  let service: QueryCacheService;
  let mockRedis: {
    get: ReturnType<typeof vi.fn>;
    setex: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    keys: ReturnType<typeof vi.fn>;
    quit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = new QueryCacheService();
    mockRedis = (service as any).redis;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return null when cache miss', async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await service.get('t-1', 'hash-1');
    expect(result).toBeNull();
  });

  it('should return parsed result when cache hit', async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify({ count: 42 }));
    const result = await service.get('t-1', 'hash-1');
    expect(result).toEqual({ count: 42 });
  });

  it('should build correct cache key', async () => {
    mockRedis.get.mockResolvedValue(null);
    await service.get('t-1', 'hash-abc');
    expect(mockRedis.get).toHaveBeenCalledWith('query_cache:t-1:hash-abc');
  });

  it('should set cache with default TTL', async () => {
    mockRedis.setex.mockResolvedValue('OK');
    await service.set('t-1', 'hash-1', { data: true });
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'query_cache:t-1:hash-1',
      300,
      JSON.stringify({ data: true }),
    );
  });

  it('should set cache with custom TTL', async () => {
    mockRedis.setex.mockResolvedValue('OK');
    await service.set('t-1', 'hash-1', { data: true }, 600);
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'query_cache:t-1:hash-1',
      600,
      JSON.stringify({ data: true }),
    );
  });

  it('should invalidate a specific cache entry', async () => {
    mockRedis.del.mockResolvedValue(1);
    await service.invalidate('t-1', 'hash-1');
    expect(mockRedis.del).toHaveBeenCalledWith('query_cache:t-1:hash-1');
  });

  it('should invalidate all cache entries for a tenant', async () => {
    mockRedis.keys.mockResolvedValue(['query_cache:t-1:a', 'query_cache:t-1:b']);
    mockRedis.del.mockResolvedValue(2);
    await service.invalidateAll('t-1');
    expect(mockRedis.keys).toHaveBeenCalledWith('query_cache:t-1:*');
    expect(mockRedis.del).toHaveBeenCalledWith('query_cache:t-1:a', 'query_cache:t-1:b');
  });

  it('should not call del when no keys found for invalidateAll', async () => {
    mockRedis.del.mockClear();
    mockRedis.keys.mockResolvedValue([]);
    await service.invalidateAll('t-1');
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it('should quit redis on module destroy', async () => {
    mockRedis.quit.mockResolvedValue('OK');
    await service.onModuleDestroy();
    expect(mockRedis.quit).toHaveBeenCalled();
  });
});
