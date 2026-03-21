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
    mockRedis.get.mockReset();
    mockRedis.setex.mockReset();
    mockRedis.del.mockReset();
    mockRedis.keys.mockReset();
    mockRedis.quit.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return cached value when found', async () => {
    const data = { total: 100 };
    mockRedis.get.mockResolvedValue(JSON.stringify(data));

    const result = await service.get('tenant-1', 'hash-1');
    expect(result).toEqual(data);
    expect(mockRedis.get).toHaveBeenCalledWith('query_cache:tenant-1:hash-1');
  });

  it('should return null when cache miss', async () => {
    mockRedis.get.mockResolvedValue(null);

    const result = await service.get('tenant-1', 'hash-1');
    expect(result).toBeNull();
  });

  it('should set value with default TTL', async () => {
    mockRedis.setex.mockResolvedValue('OK');

    await service.set('tenant-1', 'hash-1', { total: 100 });
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'query_cache:tenant-1:hash-1',
      300,
      JSON.stringify({ total: 100 }),
    );
  });

  it('should set value with custom TTL', async () => {
    mockRedis.setex.mockResolvedValue('OK');

    await service.set('tenant-1', 'hash-1', { total: 100 }, 60);
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'query_cache:tenant-1:hash-1',
      60,
      JSON.stringify({ total: 100 }),
    );
  });

  it('should invalidate a single cache entry', async () => {
    mockRedis.del.mockResolvedValue(1);

    await service.invalidate('tenant-1', 'hash-1');
    expect(mockRedis.del).toHaveBeenCalledWith('query_cache:tenant-1:hash-1');
  });

  it('should invalidate all cache entries for a tenant', async () => {
    mockRedis.keys.mockResolvedValue([
      'query_cache:tenant-1:hash-1',
      'query_cache:tenant-1:hash-2',
    ]);
    mockRedis.del.mockResolvedValue(2);

    await service.invalidateAll('tenant-1');
    expect(mockRedis.keys).toHaveBeenCalledWith('query_cache:tenant-1:*');
    expect(mockRedis.del).toHaveBeenCalledWith(
      'query_cache:tenant-1:hash-1',
      'query_cache:tenant-1:hash-2',
    );
  });

  it('should not call del when no keys found', async () => {
    mockRedis.keys.mockResolvedValue([]);

    await service.invalidateAll('tenant-1');
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it('should quit redis on module destroy', async () => {
    mockRedis.quit.mockResolvedValue('OK');

    await service.onModuleDestroy();
    expect(mockRedis.quit).toHaveBeenCalled();
  });
});
