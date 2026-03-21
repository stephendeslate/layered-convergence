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
      updatePosition: vi.fn(),
    };
    gateway = new GpsGateway(gpsService as unknown as GpsService);

    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    gateway.server = mockServer as unknown as Server;
  });

  describe('handleConnection', () => {
    it('should join company room when companyId provided', () => {
      const client = {
        handshake: { query: { companyId: 'c-1' } },
        join: vi.fn(),
      } as unknown as Socket;

      gateway.handleConnection(client);
      expect(client.join).toHaveBeenCalledWith('company:c-1');
    });

    it('should not join room when companyId not provided', () => {
      const client = {
        handshake: { query: {} },
        join: vi.fn(),
      } as unknown as Socket;

      gateway.handleConnection(client);
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect without error', () => {
      const client = {} as unknown as Socket;
      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  describe('handlePositionUpdate', () => {
    it('should update position and broadcast to company room', async () => {
      const data = { technicianId: 'tech-1', lat: 40.0, lng: -74.0, timestamp: 12345 };
      const client = {} as unknown as Socket;

      gpsService.updatePosition.mockResolvedValue({
        id: 'tech-1',
        name: 'Tech 1',
        companyId: 'c-1',
        currentLat: 40.0,
        currentLng: -74.0,
      });

      const result = await gateway.handlePositionUpdate(data, client);

      expect(gpsService.updatePosition).toHaveBeenCalledWith(data);
      expect(mockServer.to).toHaveBeenCalledWith('company:c-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({
          technicianId: 'tech-1',
          name: 'Tech 1',
          lat: 40.0,
          lng: -74.0,
        }),
      );
      expect(result).toEqual({
        event: 'position:ack',
        data: { success: true },
      });
    });
  });

  describe('handleJoinCompany', () => {
    it('should join client to company room', () => {
      const client = { join: vi.fn() } as unknown as Socket;
      const result = gateway.handleJoinCompany({ companyId: 'c-2' }, client);

      expect(client.join).toHaveBeenCalledWith('company:c-2');
      expect(result).toEqual({
        event: 'company:joined',
        data: { companyId: 'c-2' },
      });
    });
  });
});
