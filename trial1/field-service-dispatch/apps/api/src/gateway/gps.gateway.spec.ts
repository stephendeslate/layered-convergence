import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { GpsGateway } from './gps.gateway';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { GpsHistoryService } from './gps-history.service';

function createMockSocket(overrides: Record<string, any> = {}) {
  return {
    id: 'socket-1',
    handshake: {
      auth: { token: 'valid-jwt-token' },
      query: {},
    },
    join: vi.fn().mockResolvedValue(undefined),
    emit: vi.fn(),
    disconnect: vi.fn(),
    ...overrides,
  } as any;
}

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let jwtService: any;
  let redis: any;
  let prisma: any;
  let gpsHistory: any;

  beforeEach(async () => {
    jwtService = {
      verify: vi.fn().mockReturnValue({
        sub: 'user-1',
        companyId: 'company-1',
        role: 'TECHNICIAN',
        email: 'tech@test.com',
      }),
    };

    redis = {
      hset: vi.fn().mockResolvedValue(undefined),
      hget: vi.fn().mockResolvedValue(null),
      hgetall: vi.fn().mockResolvedValue({}),
    };

    prisma = {
      technician: {
        findUnique: vi.fn().mockResolvedValue({ id: 'tech-1' }),
        update: vi.fn().mockResolvedValue({}),
      },
      technicianPosition: {
        create: vi.fn().mockResolvedValue({}),
      },
    };

    gpsHistory = {
      addPosition: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsGateway,
        { provide: JwtService, useValue: jwtService },
        { provide: RedisService, useValue: redis },
        { provide: PrismaService, useValue: prisma },
        { provide: GpsHistoryService, useValue: gpsHistory },
      ],
    }).compile();

    gateway = module.get<GpsGateway>(GpsGateway);
    // Mock the server
    (gateway as any).server = {
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
    };
  });

  describe('handleConnection', () => {
    it('should authenticate and join rooms for a technician', async () => {
      const socket = createMockSocket();

      await gateway.handleConnection(socket);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
      expect(socket.join).toHaveBeenCalledWith('company:company-1');
      expect(socket.join).toHaveBeenCalledWith('technician:tech-1');
    });

    it('should disconnect client without token', async () => {
      const socket = createMockSocket({
        handshake: { auth: {}, query: {} },
      });

      await gateway.handleConnection(socket);

      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client with invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const socket = createMockSocket();
      await gateway.handleConnection(socket);

      expect(socket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleGpsUpdate', () => {
    it('should process GPS update from a technician', async () => {
      const socket = createMockSocket();
      // First, connect the technician
      await gateway.handleConnection(socket);

      const gpsData = {
        latitude: 39.7392,
        longitude: -104.9903,
        accuracy: 10,
        heading: 90,
        speed: 15,
        timestamp: new Date().toISOString(),
      };

      const result = await gateway.handleGpsUpdate(socket, gpsData);

      expect(result).toEqual({ success: true });
      expect(redis.hset).toHaveBeenCalledWith(
        'gps:company-1',
        'tech-1',
        expect.any(String),
      );
      expect(prisma.technician.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tech-1' },
          data: expect.objectContaining({
            currentLatitude: 39.7392,
            currentLongitude: -104.9903,
          }),
        }),
      );
      expect(gpsHistory.addPosition).toHaveBeenCalled();
      expect((gateway as any).server.to).toHaveBeenCalledWith('company:company-1');
    });

    it('should reject GPS update from non-technician', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-2',
        companyId: 'company-1',
        role: 'DISPATCHER',
        email: 'disp@test.com',
      });
      prisma.technician.findUnique.mockResolvedValue(null);

      const socket = createMockSocket();
      await gateway.handleConnection(socket);

      const result = await gateway.handleGpsUpdate(socket, {
        latitude: 39.7392,
        longitude: -104.9903,
        accuracy: 10,
        heading: null,
        speed: null,
        timestamp: new Date().toISOString(),
      });

      expect(result).toEqual({ error: 'Not authorized as technician' });
    });
  });

  describe('handleSubscribe', () => {
    it('should subscribe to technician GPS updates', async () => {
      const socket = createMockSocket();
      await gateway.handleConnection(socket);

      const result = await gateway.handleSubscribe(socket, {
        technicianId: 'tech-2',
      });

      expect(result).toEqual({ success: true });
      expect(socket.join).toHaveBeenCalledWith('technician:tech-2');
    });

    it('should send last known position on subscribe', async () => {
      const lastPos = JSON.stringify({
        technicianId: 'tech-2',
        latitude: 39.74,
        longitude: -104.99,
        timestamp: new Date().toISOString(),
      });
      redis.hget.mockResolvedValue(lastPos);

      const socket = createMockSocket();
      await gateway.handleConnection(socket);

      await gateway.handleSubscribe(socket, { technicianId: 'tech-2' });

      expect(socket.emit).toHaveBeenCalledWith(
        'gps:position',
        expect.objectContaining({ technicianId: 'tech-2' }),
      );
    });
  });

  describe('health', () => {
    it('should report connection count', () => {
      expect(gateway.getConnectionCount()).toBe(0);
    });

    it('should report healthy when server exists', () => {
      expect(gateway.isHealthy()).toBe(true);
    });
  });
});
