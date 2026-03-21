import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsGateway } from '../src/modules/gps-gateway/gps.gateway';
import { TechnicianService } from '../src/modules/technician/technician.service';
import { Server, Socket } from 'socket.io';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let mockTechnicianService: { updateLocation: ReturnType<typeof vi.fn> };
  let mockServer: { to: ReturnType<typeof vi.fn> };
  let mockClient: Partial<Socket>;

  beforeEach(() => {
    mockTechnicianService = {
      updateLocation: vi.fn().mockResolvedValue({}),
    };
    mockServer = {
      to: vi.fn().mockReturnValue({ emit: vi.fn() }),
    };
    mockClient = {
      id: 'client-1',
      join: vi.fn(),
      leave: vi.fn(),
    };
    gateway = new GpsGateway(mockTechnicianService as unknown as TechnicianService);
    gateway.server = mockServer as unknown as Server;
  });

  it('should handle GPS update and persist location', async () => {
    const payload = {
      technicianId: 'tech-1',
      lat: 40.7128,
      lng: -74.006,
      timestamp: new Date().toISOString(),
    };

    const result = await gateway.handleGpsUpdate(mockClient as Socket, payload);

    expect(result).toEqual({ status: 'ok' });
    expect(mockTechnicianService.updateLocation).toHaveBeenCalledWith('tech-1', { lat: 40.7128, lng: -74.006 });
  });

  it('should broadcast GPS position to subscribed clients', async () => {
    const emit = vi.fn();
    mockServer.to.mockReturnValue({ emit });

    const payload = {
      technicianId: 'tech-1',
      lat: 40.7128,
      lng: -74.006,
      timestamp: '2024-01-15T10:00:00Z',
    };

    await gateway.handleGpsUpdate(mockClient as Socket, payload);

    expect(mockServer.to).toHaveBeenCalledWith('tech:tech-1');
    expect(emit).toHaveBeenCalledWith('gps:position', expect.objectContaining({
      technicianId: 'tech-1',
      lat: 40.7128,
      lng: -74.006,
    }));
  });

  it('should subscribe client to technician GPS updates', () => {
    const result = gateway.handleSubscribe(mockClient as Socket, { technicianId: 'tech-1' });

    expect(mockClient.join).toHaveBeenCalledWith('tech:tech-1');
    expect(result).toEqual({ status: 'subscribed' });
  });

  it('should unsubscribe client from technician GPS updates', () => {
    const result = gateway.handleUnsubscribe(mockClient as Socket, { technicianId: 'tech-1' });

    expect(mockClient.leave).toHaveBeenCalledWith('tech:tech-1');
    expect(result).toEqual({ status: 'unsubscribed' });
  });
});
