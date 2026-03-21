import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GpsGateway } from './gps.gateway';
import { GpsService } from './gps.service';

const mockGpsService = {
  updateLocation: vi.fn(),
  getLocations: vi.fn(),
  getTechnicianLocation: vi.fn(),
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

    gateway.server = {
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join company room when companyId provided', () => {
      const mockClient = {
        id: 'client-1',
        handshake: { query: { companyId: 'comp-1' } },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(mockClient);
      expect(mockClient.join).toHaveBeenCalledWith('company:comp-1');
    });

    it('should not join room when companyId not provided', () => {
      const mockClient = {
        id: 'client-2',
        handshake: { query: {} },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(mockClient);
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client from connected map', () => {
      const mockClient = {
        id: 'client-1',
        handshake: { query: { companyId: 'comp-1' } },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(mockClient);
      expect(gateway.getConnectedClientCount()).toBe(1);

      gateway.handleDisconnect(mockClient);
      expect(gateway.getConnectedClientCount()).toBe(0);
    });
  });

  describe('handleLocationUpdate', () => {
    it('should update location and broadcast', async () => {
      mockGpsService.updateLocation.mockResolvedValue({ count: 1 });

      const mockClient = { id: 'client-1' } as any;
      const data = {
        technicianId: 'tech-1',
        companyId: 'comp-1',
        lat: 40.7,
        lng: -74.0,
        timestamp: 1234567890,
      };

      const result = await gateway.handleLocationUpdate(data, mockClient);

      expect(result).toEqual({ success: true });
      expect(mockGpsService.updateLocation).toHaveBeenCalledWith(
        'comp-1',
        'tech-1',
        40.7,
        -74.0,
      );
      expect(gateway.server.to).toHaveBeenCalledWith('company:comp-1');
    });
  });

  describe('handleSubscribe', () => {
    it('should join company room', () => {
      const mockClient = { join: vi.fn() } as any;
      gateway.handleSubscribe({ companyId: 'comp-1' }, mockClient);
      expect(mockClient.join).toHaveBeenCalledWith('company:comp-1');
    });
  });

  describe('broadcastLocation', () => {
    it('should broadcast to company room', () => {
      gateway.broadcastLocation('comp-1', 'tech-1', 40.7, -74.0);
      expect(gateway.server.to).toHaveBeenCalledWith('company:comp-1');
    });
  });

  describe('getConnectedClientCount', () => {
    it('should return 0 initially', () => {
      expect(gateway.getConnectedClientCount()).toBe(0);
    });
  });
});
