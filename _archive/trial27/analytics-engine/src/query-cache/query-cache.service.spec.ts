import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  let mockRedis: any;

  beforeEach(() => {
    service = new QueryCacheService();
    mockRedis = (service as any).redis;
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return parsed cached value', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ value: 42 }));
      const result = await service.get('t-1', 'hash-1');
      expect(result).toEqual({ value: 42 });
    });

    it('should return null when no cached value', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await service.get('t-1', 'hash-1');
      expect(result).toBeNull();
    });

    it('should use correct key format', async () => {
      mockRedis.get.mockResolvedValue(null);
      await service.get('t-1', 'hash-1');
      expect(mockRedis.get).toHaveBeenCalledWith('query_cache:t-1:hash-1');
    });
  });

  describe('set', () => {
    it('should store value with default TTL', async () => {
      mockRedis.setex.mockResolvedValue('OK');
      await service.set('t-1', 'hash-1', { data: 'test' });
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'query_cache:t-1:hash-1',
        300,
        JSON.stringify({ data: 'test' }),
      );
    });

    it('should store value with custom TTL', async () => {
      mockRedis.setex.mockResolvedValue('OK');
      await service.set('t-1', 'hash-1', { data: 'test' }, 60);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'query_cache:t-1:hash-1',
        60,
        expect.any(String),
      );
    });
  });

  describe('invalidate', () => {
    it('should delete specific cache key', async () => {
      mockRedis.del.mockResolvedValue(1);
      await service.invalidate('t-1', 'hash-1');
      expect(mockRedis.del).toHaveBeenCalledWith('query_cache:t-1:hash-1');
    });
  });

  describe('invalidateAll', () => {
    it('should delete all keys matching tenant pattern', async () => {
      mockRedis.keys.mockResolvedValue(['query_cache:t-1:a', 'query_cache:t-1:b']);
      mockRedis.del.mockResolvedValue(2);
      await service.invalidateAll('t-1');
      expect(mockRedis.keys).toHaveBeenCalledWith('query_cache:t-1:*');
      expect(mockRedis.del).toHaveBeenCalledWith('query_cache:t-1:a', 'query_cache:t-1:b');
    });

    it('should not call del when no keys match', async () => {
      mockRedis.keys.mockResolvedValue([]);
      await service.invalidateAll('t-1');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit redis connection', async () => {
      mockRedis.quit.mockResolvedValue('OK');
      await service.onModuleDestroy();
      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });
});
