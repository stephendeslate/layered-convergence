import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsGateway } from './gps.gateway.js';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let mockServer: any;

  beforeEach(() => {
    gateway = new GpsGateway();
    mockServer = {
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
    };
    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join company room when companyId query param is provided', () => {
      const mockClient = {
        handshake: { query: { companyId: 'c1' } },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(mockClient);
      expect(mockClient.join).toHaveBeenCalledWith('company:c1');
    });

    it('should not join room when companyId is missing', () => {
      const mockClient = {
        handshake: { query: {} },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(mockClient);
      expect(mockClient.join).not.toHaveBeenCalled();
    });

    it('should not join room when companyId is an array', () => {
      const mockClient = {
        handshake: { query: { companyId: ['a', 'b'] } },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(mockClient);
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
    it('should broadcast position to company room', () => {
      const data = { technicianId: 't1', lat: 40.7128, lng: -74.006 };
      const mockClient = {
        handshake: { query: { companyId: 'c1' } },
      } as any;

      const result = gateway.handlePositionUpdate(data, mockClient);

      expect(mockServer.to).toHaveBeenCalledWith('company:c1');
      expect(mockServer.to('company:c1').emit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({
          technicianId: 't1',
          lat: 40.7128,
          lng: -74.006,
          timestamp: expect.any(String),
        }),
      );
      expect(result).toEqual({ event: 'position:ack', data: { received: true } });
    });

    it('should not broadcast when companyId is missing', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const mockClient = {
        handshake: { query: {} },
      } as any;

      gateway.handlePositionUpdate(data, mockClient);
      expect(mockServer.to).not.toHaveBeenCalled();
    });

    it('should return ack response', () => {
      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      const mockClient = {
        handshake: { query: { companyId: 'c1' } },
      } as any;

      const result = gateway.handlePositionUpdate(data, mockClient);
      expect(result.event).toBe('position:ack');
      expect(result.data.received).toBe(true);
    });
  });
});
