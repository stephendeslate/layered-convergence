import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { GpsGateway } from './gps.gateway';
import { GpsService } from './gps.service';

const mockGpsService = {
  updatePosition: vi.fn(),
  getPosition: vi.fn(),
  getCompanyPositions: vi.fn(),
};

describe('GpsGateway', () => {
  let gateway: GpsGateway;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GpsGateway,
        { provide: GpsService, useValue: mockGpsService },
      ],
    }).compile();

    gateway = module.get(GpsGateway);
    gateway.server = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as any;
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join company room when companyId provided', () => {
      const client = {
        handshake: { query: { companyId: 'comp-1' } },
        join: vi.fn(),
      } as any;
      gateway.handleConnection(client);
      expect(client.join).toHaveBeenCalledWith('company:comp-1');
    });

    it('should not join room when no companyId', () => {
      const client = {
        handshake: { query: {} },
        join: vi.fn(),
      } as any;
      gateway.handleConnection(client);
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect without error', () => {
      expect(() => gateway.handleDisconnect({} as any)).not.toThrow();
    });
  });

  describe('handlePositionUpdate', () => {
    it('should update position and broadcast', async () => {
      const data = { technicianId: 'tech-1', lat: 40.0, lng: -74.0, timestamp: Date.now() };
      mockGpsService.updatePosition.mockResolvedValue({
        id: 'tech-1',
        name: 'Alice',
        companyId: 'comp-1',
        currentLat: 40.0,
        currentLng: -74.0,
      });

      const result = await gateway.handlePositionUpdate(data, {} as any);
      expect(result).toEqual({ event: 'position:ack', data: { success: true } });
      expect(gateway.server.to).toHaveBeenCalledWith('company:comp-1');
    });
  });

  describe('handleJoinCompany', () => {
    it('should join company room', () => {
      const client = { join: vi.fn() } as any;
      const result = gateway.handleJoinCompany({ companyId: 'comp-1' }, client);
      expect(client.join).toHaveBeenCalledWith('company:comp-1');
      expect(result).toEqual({
        event: 'company:joined',
        data: { companyId: 'comp-1' },
      });
    });
  });
});
