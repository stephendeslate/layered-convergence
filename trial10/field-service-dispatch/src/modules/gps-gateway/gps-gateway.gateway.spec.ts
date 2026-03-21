import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsGateway } from './gps-gateway.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { Server, Socket } from 'socket.io';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let prisma: any;
  let mockServer: any;

  beforeEach(() => {
    prisma = {
      technician: {
        update: vi.fn(),
      },
    };
    mockServer = {
      emit: vi.fn(),
    };
    gateway = new GpsGateway(prisma as unknown as PrismaService);
    gateway.server = mockServer as unknown as Server;
  });

  it('should update technician position on position:update message', async () => {
    prisma.technician.update.mockResolvedValue({
      id: 'tech1',
      currentLat: 40.7128,
      currentLng: -74.006,
    });

    const mockClient = { id: 'client1' } as Socket;

    await gateway.handlePositionUpdate(
      { technicianId: 'tech1', lat: 40.7128, lng: -74.006 },
      mockClient,
    );

    expect(prisma.technician.update).toHaveBeenCalledWith({
      where: { id: 'tech1' },
      data: { currentLat: 40.7128, currentLng: -74.006 },
    });
  });

  it('should broadcast position update to all connected clients', async () => {
    prisma.technician.update.mockResolvedValue({});
    const mockClient = { id: 'client1' } as Socket;

    await gateway.handlePositionUpdate(
      { technicianId: 'tech1', lat: 40.7128, lng: -74.006 },
      mockClient,
    );

    expect(mockServer.emit).toHaveBeenCalledWith(
      'position:updated',
      expect.objectContaining({
        technicianId: 'tech1',
        lat: 40.7128,
        lng: -74.006,
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle client connection', () => {
    const mockClient = { id: 'client1' } as Socket;
    // Should not throw
    expect(() => gateway.handleConnection(mockClient)).not.toThrow();
  });

  it('should handle client disconnection', () => {
    const mockClient = { id: 'client1' } as Socket;
    // Should not throw
    expect(() => gateway.handleDisconnect(mockClient)).not.toThrow();
  });
});
