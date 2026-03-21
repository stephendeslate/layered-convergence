import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsGateway } from './gps.gateway.js';

describe('GpsGateway', () => {
  let gateway: GpsGateway;

  beforeEach(() => {
    gateway = new GpsGateway();
    gateway.server = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join company room when companyId provided', () => {
      const client = {
        handshake: { query: { companyId: 'c1' } },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(client);
      expect(client.join).toHaveBeenCalledWith('company:c1');
    });

    it('should not join room when companyId is missing', () => {
      const client = {
        handshake: { query: {} },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(client);
      expect(client.join).not.toHaveBeenCalled();
    });

    it('should not join room when companyId is array', () => {
      const client = {
        handshake: { query: { companyId: ['a', 'b'] } },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(client);
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
      } as any;

      gateway.handlePositionUpdate(data, client);

      expect(gateway.server.to).toHaveBeenCalledWith('company:c1');
      expect(gateway.server.emit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({
          technicianId: 't1',
          lat: 40.7,
          lng: -74.0,
          timestamp: expect.any(String),
        }),
      );
    });

    it('should return ack response', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const client = {
        handshake: { query: { companyId: 'c1' } },
      } as any;

      const result = gateway.handlePositionUpdate(data, client);
      expect(result).toEqual({ event: 'position:ack', data: { received: true } });
    });

    it('should not broadcast when no companyId', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const client = {
        handshake: { query: {} },
      } as any;

      gateway.handlePositionUpdate(data, client);
      expect(gateway.server.to).not.toHaveBeenCalled();
    });

    it('should include timestamp in broadcast', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const client = {
        handshake: { query: { companyId: 'c1' } },
      } as any;

      gateway.handlePositionUpdate(data, client);

      expect(gateway.server.emit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({ timestamp: expect.any(String) }),
      );
    });

    it('should pass through technician coordinates', () => {
      const data = { technicianId: 't2', lat: 41.5, lng: -72.3 };
      const client = {
        handshake: { query: { companyId: 'c2' } },
      } as any;

      gateway.handlePositionUpdate(data, client);

      expect(gateway.server.emit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({ lat: 41.5, lng: -72.3 }),
      );
    });
  });
});
