import { describe, it, expect, beforeEach } from 'vitest';
import { QueryCacheService } from './query-cache.service';

const mockRedis = {
  get: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  quit: vi.fn(),
};

vi.mock('ioredis', () => ({
  Redis: vi.fn().mockImplementation(() => mockRedis),
}));

describe('QueryCacheService', () => {
  let service: QueryCacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new QueryCacheService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return null for cache miss', async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await service.get('t1', 'hash1');
    expect(result).toBeNull();
  });

  it('should return parsed data for cache hit', async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'value' }));
    const result = await service.get('t1', 'hash1');
    expect(result).toEqual({ data: 'value' });
  });

  it('should set cache with default TTL', async () => {
    await service.set('t1', 'hash1', { data: 'value' });
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'query_cache:t1:hash1',
      300,
      JSON.stringify({ data: 'value' }),
    );
  });

  it('should set cache with custom TTL', async () => {
    await service.set('t1', 'hash1', { data: 'value' }, 600);
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'query_cache:t1:hash1',
      600,
      JSON.stringify({ data: 'value' }),
    );
  });

  it('should invalidate a specific cache key', async () => {
    await service.invalidate('t1', 'hash1');
    expect(mockRedis.del).toHaveBeenCalledWith('query_cache:t1:hash1');
  });

  it('should invalidate all cache keys for a tenant', async () => {
    mockRedis.keys.mockResolvedValue(['query_cache:t1:a', 'query_cache:t1:b']);
    await service.invalidateAll('t1');
    expect(mockRedis.keys).toHaveBeenCalledWith('query_cache:t1:*');
    expect(mockRedis.del).toHaveBeenCalledWith('query_cache:t1:a', 'query_cache:t1:b');
  });

  it('should not call del when no keys to invalidate', async () => {
    mockRedis.keys.mockResolvedValue([]);
    await service.invalidateAll('t1');
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it('should build correct cache key format', async () => {
    mockRedis.get.mockResolvedValue(null);
    await service.get('tenant-123', 'abc-hash');
    expect(mockRedis.get).toHaveBeenCalledWith('query_cache:tenant-123:abc-hash');
  });

  it('should quit redis on module destroy', async () => {
    await service.onModuleDestroy();
    expect(mockRedis.quit).toHaveBeenCalled();
  });
});
