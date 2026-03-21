import { GpsGateway } from './gps.gateway.js';
import { Socket, Server } from 'socket.io';

const makeSocket = (companyId?: string): Socket =>
  ({
    handshake: {
      query: companyId ? { companyId } : {},
    },
    join: vi.fn(),
  }) as unknown as Socket;

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let mockServer: { to: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new GpsGateway();
    mockServer = {
      to: vi.fn().mockReturnValue({ emit: vi.fn() }),
    };
    gateway.server = mockServer as unknown as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join company room when companyId is provided', () => {
      const client = makeSocket('co-1');
      gateway.handleConnection(client);
      expect(client.join).toHaveBeenCalledWith('company:co-1');
    });

    it('should not join any room when companyId is missing', () => {
      const client = makeSocket();
      gateway.handleConnection(client);
      expect(client.join).not.toHaveBeenCalled();
    });

    it('should not join when companyId is an array', () => {
      const client = {
        handshake: { query: { companyId: ['a', 'b'] } },
        join: vi.fn(),
      } as unknown as Socket;
      gateway.handleConnection(client);
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect without error', () => {
      const client = makeSocket('co-1');
      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  describe('handlePositionUpdate', () => {
    it('should broadcast position to company room', () => {
      const client = makeSocket('co-1');
      const data = { technicianId: 'tech-1', lat: 40.7, lng: -74.0 };

      const result = gateway.handlePositionUpdate(data, client);

      expect(mockServer.to).toHaveBeenCalledWith('company:co-1');
      expect(result).toEqual({ event: 'position:ack', data: { received: true } });
    });

    it('should not broadcast when companyId is missing', () => {
      const client = makeSocket();
      const data = { technicianId: 'tech-1', lat: 40.7, lng: -74.0 };

      const result = gateway.handlePositionUpdate(data, client);

      expect(mockServer.to).not.toHaveBeenCalled();
      expect(result).toEqual({ event: 'position:ack', data: { received: true } });
    });

    it('should include timestamp in broadcast payload', () => {
      const client = makeSocket('co-1');
      const emitFn = vi.fn();
      mockServer.to.mockReturnValue({ emit: emitFn });

      const data = { technicianId: 'tech-1', lat: 40.7, lng: -74.0 };
      gateway.handlePositionUpdate(data, client);

      expect(emitFn).toHaveBeenCalledWith('position:updated', {
        technicianId: 'tech-1',
        lat: 40.7,
        lng: -74.0,
        timestamp: expect.any(String),
      });
    });
  });
});
