import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsGateway } from './gps.gateway.js';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let mockServer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new GpsGateway();
    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join company room when companyId provided', () => {
      const mockClient = {
        handshake: { query: { companyId: 'c1' } },
        join: vi.fn(),
      };
      gateway.handleConnection(mockClient as any);
      expect(mockClient.join).toHaveBeenCalledWith('company:c1');
    });

    it('should not join room when companyId missing', () => {
      const mockClient = {
        handshake: { query: {} },
        join: vi.fn(),
      };
      gateway.handleConnection(mockClient as any);
      expect(mockClient.join).not.toHaveBeenCalled();
    });

    it('should not join room when companyId is not a string', () => {
      const mockClient = {
        handshake: { query: { companyId: ['c1', 'c2'] } },
        join: vi.fn(),
      };
      gateway.handleConnection(mockClient as any);
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect without error', () => {
      const mockClient = {} as any;
      expect(() => gateway.handleDisconnect(mockClient)).not.toThrow();
    });
  });

  describe('handlePositionUpdate', () => {
    it('should broadcast position update to company room', () => {
      const data = { technicianId: 't1', lat: 40.7128, lng: -74.006 };
      const mockClient = {
        handshake: { query: { companyId: 'c1' } },
      };
      gateway.handlePositionUpdate(data, mockClient as any);
      expect(mockServer.to).toHaveBeenCalledWith('company:c1');
      expect(mockServer.emit).toHaveBeenCalledWith('position:updated', expect.objectContaining({
        technicianId: 't1',
        lat: 40.7128,
        lng: -74.006,
        timestamp: expect.any(String),
      }));
    });

    it('should return ack response', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const mockClient = {
        handshake: { query: { companyId: 'c1' } },
      };
      const result = gateway.handlePositionUpdate(data, mockClient as any);
      expect(result).toEqual({ event: 'position:ack', data: { received: true } });
    });

    it('should not broadcast when companyId missing', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const mockClient = {
        handshake: { query: {} },
      };
      gateway.handlePositionUpdate(data, mockClient as any);
      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });
});
