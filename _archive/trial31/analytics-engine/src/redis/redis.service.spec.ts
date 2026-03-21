import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let mockClient: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    service = Object.create(RedisService.prototype);
    mockClient = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      quit: vi.fn(),
    };
    (service as any).client = mockClient;
  });

  describe('get', () => {
    it('should return value for key', async () => {
      mockClient.get.mockResolvedValue('value');
      const result = await service.get('key');
      expect(result).toBe('value');
    });

    it('should return null for missing key', async () => {
      mockClient.get.mockResolvedValue(null);
      const result = await service.get('missing');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      mockClient.set.mockResolvedValue('OK');
      await service.set('key', 'value');
      expect(mockClient.set).toHaveBeenCalledWith('key', 'value');
    });

    it('should set value with TTL', async () => {
      mockClient.set.mockResolvedValue('OK');
      await service.set('key', 'value', 60);
      expect(mockClient.set).toHaveBeenCalledWith('key', 'value', 'EX', 60);
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      mockClient.del.mockResolvedValue(1);
      await service.del('key');
      expect(mockClient.del).toHaveBeenCalledWith('key');
    });
  });

  describe('getJson', () => {
    it('should parse JSON value', async () => {
      mockClient.get.mockResolvedValue('{"foo":"bar"}');
      const result = await service.getJson('key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return null for missing key', async () => {
      mockClient.get.mockResolvedValue(null);
      const result = await service.getJson('key');
      expect(result).toBeNull();
    });
  });

  describe('setJson', () => {
    it('should stringify and set value', async () => {
      mockClient.set.mockResolvedValue('OK');
      await service.setJson('key', { foo: 'bar' });
      expect(mockClient.set).toHaveBeenCalledWith('key', '{"foo":"bar"}');
    });

    it('should set JSON with TTL', async () => {
      mockClient.set.mockResolvedValue('OK');
      await service.setJson('key', { a: 1 }, 300);
      expect(mockClient.set).toHaveBeenCalledWith('key', '{"a":1}', 'EX', 300);
    });
  });

  describe('getClient', () => {
    it('should return the redis client', () => {
      const client = service.getClient();
      expect(client).toBe(mockClient);
    });
  });
});
