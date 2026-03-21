import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockPrisma: any;
  let mockRedis: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      $queryRaw: vi.fn(),
    };

    mockRedis = {
      isHealthy: vi.fn(),
    };

    controller = new HealthController(
      mockPrisma as unknown as PrismaService,
      mockRedis as unknown as RedisService,
    );
  });

  describe('GET /health', () => {
    it('should return ok status with timestamp', () => {
      const result = controller.check();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('GET /health/db', () => {
    it('should return ok when database is reachable', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.checkDb();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('database');
    });

    it('should return error when database is unreachable', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.checkDb();

      expect(result.status).toBe('error');
      expect(result.service).toBe('database');
      expect(result.message).toBe('Connection refused');
    });
  });

  describe('GET /health/redis', () => {
    it('should return ok when Redis is healthy', async () => {
      mockRedis.isHealthy.mockResolvedValue(true);

      const result = await controller.checkRedis();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('redis');
    });

    it('should return error when Redis is unhealthy', async () => {
      mockRedis.isHealthy.mockResolvedValue(false);

      const result = await controller.checkRedis();

      expect(result.status).toBe('error');
      expect(result.service).toBe('redis');
    });

    it('should return error when Redis throws', async () => {
      mockRedis.isHealthy.mockRejectedValue(new Error('Redis down'));

      const result = await controller.checkRedis();

      expect(result.status).toBe('error');
      expect(result.service).toBe('redis');
      expect(result.message).toBe('Redis down');
    });
  });
});
