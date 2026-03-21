import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsGateway } from './gps.gateway';
import { GpsService } from './gps.service';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let gpsService: any;
  let mockServer: any;
  let mockClient: any;

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

    mockClient = {
      id: 'client-1',
      join: vi.fn(),
      handshake: { query: { companyId: 'company-1' } },
    };
  });

  it('should join company room on connection', () => {
    gateway.handleConnection(mockClient);
    expect(mockClient.join).toHaveBeenCalledWith('company:company-1');
  });

  it('should handle connection without companyId', () => {
    mockClient.handshake.query.companyId = undefined;
    gateway.handleConnection(mockClient);
    expect(mockClient.join).not.toHaveBeenCalled();
  });

  it('should handle disconnect', () => {
    gateway.handleConnection(mockClient);
    gateway.handleDisconnect(mockClient);
    // No error thrown - client removed from map
  });

  it('should record position and broadcast to company room', async () => {
    gateway.handleConnection(mockClient);

    const position = { technicianId: 't1', lat: 40.72, lng: -74.0 };
    gpsService.recordPosition.mockResolvedValue({
      id: 'gps1', timestamp: new Date(), ...position,
    });

    const result = await gateway.handlePositionUpdate(mockClient, position);
    expect(result.success).toBe(true);
    expect(result.eventId).toBe('gps1');
    expect(mockServer.to).toHaveBeenCalledWith('company:company-1');
    expect(mockServer.emit).toHaveBeenCalledWith(
      'position:updated',
      expect.objectContaining({ technicianId: 't1' }),
    );
  });

  it('should handle subscribe to company room', () => {
    const result = gateway.handleSubscribe(mockClient, { companyId: 'company-2' });
    expect(mockClient.join).toHaveBeenCalledWith('company:company-2');
    expect(result.success).toBe(true);
  });

  it('should not broadcast if client not in company room', async () => {
    // Don't call handleConnection, so client is not in connectedClients map
    const position = { technicianId: 't1', lat: 40.72, lng: -74.0 };
    gpsService.recordPosition.mockResolvedValue({ id: 'gps1', timestamp: new Date() });

    await gateway.handlePositionUpdate(mockClient, position);
    expect(mockServer.to).not.toHaveBeenCalled();
  });
});
