import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsTrackingGateway } from '../src/modules/gps-tracking/gps-tracking.gateway';
import { GpsTrackingService } from '../src/modules/gps-tracking/gps-tracking.service';
import { Socket, Server } from 'socket.io';

describe('GpsTrackingGateway', () => {
  let gateway: GpsTrackingGateway;
  let gpsService: { updatePosition: ReturnType<typeof vi.fn> };
  let mockServer: { emit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    gpsService = {
      updatePosition: vi.fn().mockResolvedValue({ id: 'tech1', currentLat: 40.7, currentLng: -74.0 }),
    };
    mockServer = { emit: vi.fn() };

    gateway = new GpsTrackingGateway(gpsService as unknown as GpsTrackingService);
    gateway.server = mockServer as unknown as Server;
  });

  it('handles position updates and broadcasts', async () => {
    const mockClient = { id: 'client1' } as Socket;
    const positionData = {
      technicianId: 'tech1',
      lat: 40.7128,
      lng: -74.006,
      timestamp: '2025-01-15T10:00:00Z',
    };

    await gateway.handlePositionUpdate(mockClient, positionData);

    expect(gpsService.updatePosition).toHaveBeenCalledWith('tech1', 40.7128, -74.006);
    expect(mockServer.emit).toHaveBeenCalledWith('position:updated', expect.objectContaining({
      technicianId: 'tech1',
      lat: 40.7128,
      lng: -74.006,
    }));
  });

  it('handles company subscription', () => {
    const mockClient = { id: 'client1', join: vi.fn() } as unknown as Socket;

    gateway.handleSubscribeCompany(mockClient, { companyId: 'company1' });
    expect(mockClient.join).toHaveBeenCalledWith('company:company1');
  });

  it('handles technician subscription', () => {
    const mockClient = { id: 'client1', join: vi.fn() } as unknown as Socket;

    gateway.handleSubscribeTechnician(mockClient, { technicianId: 'tech1' });
    expect(mockClient.join).toHaveBeenCalledWith('technician:tech1');
  });

  it('logs connection and disconnection', () => {
    const mockClient = { id: 'client1' } as Socket;

    // These should not throw
    expect(() => gateway.handleConnection(mockClient)).not.toThrow();
    expect(() => gateway.handleDisconnect(mockClient)).not.toThrow();
  });
});
