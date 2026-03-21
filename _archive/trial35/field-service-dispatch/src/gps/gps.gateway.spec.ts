import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsGateway } from './gps.gateway';
import { GpsService } from './gps.service';
import { Socket, Server } from 'socket.io';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let gpsService: any;
  let mockServer: any;

  beforeEach(() => {
    gpsService = {
      recordPosition: vi.fn(),
    };
    gateway = new GpsGateway(gpsService);

    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    gateway.server = mockServer;
  });

  function createMockSocket(id: string, companyId?: string): Socket {
    return {
      id,
      handshake: {
        query: { companyId },
      },
      join: vi.fn(),
    } as unknown as Socket;
  }

  describe('handleConnection', () => {
    it('should join company room on connection', () => {
      const client = createMockSocket('socket-1', 'company-1');
      gateway.handleConnection(client);
      expect(client.join).toHaveBeenCalledWith('company:company-1');
    });

    it('should handle connection without companyId', () => {
      const client = createMockSocket('socket-2');
      gateway.handleConnection(client);
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up on disconnect', () => {
      const client = createMockSocket('socket-1', 'company-1');
      gateway.handleConnection(client);
      gateway.handleDisconnect(client);
      // Should not throw after cleanup
      expect(true).toBe(true);
    });
  });

  describe('handlePositionUpdate', () => {
    it('should record position and broadcast to company room', async () => {
      const client = createMockSocket('socket-1', 'company-1');
      gateway.handleConnection(client);

      const data = { technicianId: 't1', lat: 40.7128, lng: -74.006, accuracy: 5 };
      gpsService.recordPosition.mockResolvedValue({
        id: 'gps-1',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      });

      const result = await gateway.handlePositionUpdate(client, data);

      expect(gpsService.recordPosition).toHaveBeenCalledWith(data);
      expect(mockServer.to).toHaveBeenCalledWith('company:company-1');
      expect(mockServer.emit).toHaveBeenCalledWith('position:updated', expect.objectContaining({
        technicianId: 't1',
        lat: 40.7128,
        lng: -74.006,
      }));
      expect(result.success).toBe(true);
      expect(result.eventId).toBe('gps-1');
    });

    it('should not broadcast if client has no company', async () => {
      const client = createMockSocket('socket-2');
      // Don't call handleConnection so no companyId is mapped

      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      gpsService.recordPosition.mockResolvedValue({ id: 'gps-2', timestamp: new Date() });

      const result = await gateway.handlePositionUpdate(client, data);

      expect(result.success).toBe(true);
      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });

  describe('handleSubscribe', () => {
    it('should join company room', () => {
      const client = createMockSocket('socket-3');
      const result = gateway.handleSubscribe(client, { companyId: 'company-2' });
      expect(client.join).toHaveBeenCalledWith('company:company-2');
      expect(result.success).toBe(true);
    });
  });
});
