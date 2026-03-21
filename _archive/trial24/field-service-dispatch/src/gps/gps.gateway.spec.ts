import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsGateway } from './gps.gateway.js';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let mockServer: any;

  beforeEach(() => {
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
    it('should join company room when companyId is provided', () => {
      const client = {
        handshake: { query: { companyId: 'c1' } },
        join: vi.fn(),
      };

      gateway.handleConnection(client as any);
      expect(client.join).toHaveBeenCalledWith('company:c1');
    });

    it('should not join room when companyId is missing', () => {
      const client = {
        handshake: { query: {} },
        join: vi.fn(),
      };

      gateway.handleConnection(client as any);
      expect(client.join).not.toHaveBeenCalled();
    });

    it('should not join room when companyId is not a string', () => {
      const client = {
        handshake: { query: { companyId: ['a', 'b'] } },
        join: vi.fn(),
      };

      gateway.handleConnection(client as any);
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect without errors', () => {
      const client = {} as any;
      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  describe('handlePositionUpdate', () => {
    it('should broadcast position to company room', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const client = {
        handshake: { query: { companyId: 'c1' } },
      };

      const result = gateway.handlePositionUpdate(data, client as any);

      expect(mockServer.to).toHaveBeenCalledWith('company:c1');
      expect(mockServer.emit).toHaveBeenCalledWith('position:updated', expect.objectContaining({
        technicianId: 't1',
        lat: 40.7,
        lng: -74.0,
      }));
      expect(result).toEqual({ event: 'position:ack', data: { received: true } });
    });

    it('should include timestamp in broadcast', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const client = {
        handshake: { query: { companyId: 'c1' } },
      };

      gateway.handlePositionUpdate(data, client as any);

      expect(mockServer.emit).toHaveBeenCalledWith('position:updated', expect.objectContaining({
        timestamp: expect.any(String),
      }));
    });

    it('should not broadcast when companyId is missing', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const client = {
        handshake: { query: {} },
      };

      const result = gateway.handlePositionUpdate(data, client as any);
      expect(mockServer.to).not.toHaveBeenCalled();
      expect(result).toEqual({ event: 'position:ack', data: { received: true } });
    });

    it('should return ack response', () => {
      const data = { technicianId: 't1', lat: 0, lng: 0 };
      const client = {
        handshake: { query: { companyId: 'c1' } },
      };

      const result = gateway.handlePositionUpdate(data, client as any);
      expect(result.event).toBe('position:ack');
      expect(result.data.received).toBe(true);
    });
  });
});
