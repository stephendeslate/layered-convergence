import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GpsGateway } from './gps.gateway';
import { GpsService } from './gps.service';

const mockGpsService = {
  updateLocation: vi.fn(),
};

const mockServer = {
  to: vi.fn().mockReturnThis(),
  emit: vi.fn(),
};

describe('GpsGateway', () => {
  let gateway: GpsGateway;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsGateway,
        { provide: GpsService, useValue: mockGpsService },
      ],
    }).compile();
    gateway = module.get<GpsGateway>(GpsGateway);
    (gateway as any).server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join company room when companyId provided', () => {
      const mockClient = {
        id: 'socket1',
        handshake: { query: { companyId: 'comp1' } },
        join: vi.fn(),
      };
      gateway.handleConnection(mockClient as any);
      expect(mockClient.join).toHaveBeenCalledWith('company:comp1');
    });

    it('should not join room when no companyId', () => {
      const mockClient = {
        id: 'socket1',
        handshake: { query: {} },
        join: vi.fn(),
      };
      gateway.handleConnection(mockClient as any);
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client from connected clients', () => {
      const mockClient = {
        id: 'socket1',
        handshake: { query: { companyId: 'comp1' } },
        join: vi.fn(),
      };
      gateway.handleConnection(mockClient as any);
      expect(gateway.getConnectedClientCount()).toBe(1);
      gateway.handleDisconnect(mockClient as any);
      expect(gateway.getConnectedClientCount()).toBe(0);
    });
  });

  describe('handleLocationUpdate', () => {
    it('should update location and broadcast', async () => {
      mockGpsService.updateLocation.mockResolvedValue({ count: 1 });
      const data = { technicianId: 't1', companyId: 'comp1', lat: 40.7, lng: -74.0 };
      const mockClient = { id: 'socket1' } as any;

      const result = await gateway.handleLocationUpdate(data, mockClient);
      expect(result).toEqual({ success: true });
      expect(mockGpsService.updateLocation).toHaveBeenCalledWith('comp1', 't1', 40.7, -74.0);
      expect(mockServer.to).toHaveBeenCalledWith('company:comp1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'location:updated',
        expect.objectContaining({ technicianId: 't1', lat: 40.7, lng: -74.0 }),
      );
    });

    it('should use provided timestamp', async () => {
      mockGpsService.updateLocation.mockResolvedValue({ count: 1 });
      const ts = 1700000000;
      const data = { technicianId: 't1', companyId: 'comp1', lat: 10, lng: 20, timestamp: ts };

      await gateway.handleLocationUpdate(data, { id: 'socket1' } as any);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'location:updated',
        expect.objectContaining({ timestamp: ts }),
      );
    });
  });

  describe('handleSubscribe', () => {
    it('should join company room', () => {
      const mockClient = { join: vi.fn() } as any;
      gateway.handleSubscribe({ companyId: 'comp1' }, mockClient);
      expect(mockClient.join).toHaveBeenCalledWith('company:comp1');
    });
  });

  describe('broadcastLocation', () => {
    it('should broadcast location to company room', () => {
      gateway.broadcastLocation('comp1', 't1', 40.7, -74.0);
      expect(mockServer.to).toHaveBeenCalledWith('company:comp1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'location:updated',
        expect.objectContaining({ technicianId: 't1' }),
      );
    });
  });

  describe('getConnectedClientCount', () => {
    it('should return 0 initially', () => {
      expect(gateway.getConnectedClientCount()).toBe(0);
    });

    it('should track connected clients', () => {
      const mockClient = {
        id: 'socket1',
        handshake: { query: { companyId: 'comp1' } },
        join: vi.fn(),
      };
      gateway.handleConnection(mockClient as any);
      expect(gateway.getConnectedClientCount()).toBe(1);
    });
  });
});
