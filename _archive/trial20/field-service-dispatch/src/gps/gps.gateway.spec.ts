import { GpsGateway } from './gps.gateway.js';
import { Socket, Server } from 'socket.io';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let mockServer: { to: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new GpsGateway();

    const emit = vi.fn();
    mockServer = { to: vi.fn().mockReturnValue({ emit }) };
    gateway.server = mockServer as unknown as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join company room when companyId is provided', () => {
      const join = vi.fn();
      const client = {
        handshake: { query: { companyId: 'c1' } },
        join,
      } as unknown as Socket;

      gateway.handleConnection(client);

      expect(join).toHaveBeenCalledWith('company:c1');
    });

    it('should not join room when companyId is missing', () => {
      const join = vi.fn();
      const client = {
        handshake: { query: {} },
        join,
      } as unknown as Socket;

      gateway.handleConnection(client);

      expect(join).not.toHaveBeenCalled();
    });

    it('should not join room when companyId is not a string', () => {
      const join = vi.fn();
      const client = {
        handshake: { query: { companyId: ['a', 'b'] } },
        join,
      } as unknown as Socket;

      gateway.handleConnection(client);

      expect(join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect without error', () => {
      const client = {} as unknown as Socket;
      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  describe('handlePositionUpdate', () => {
    it('should broadcast position update to company room', () => {
      const client = {
        handshake: { query: { companyId: 'c1' } },
      } as unknown as Socket;

      const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      gateway.handlePositionUpdate(data, client);

      expect(mockServer.to).toHaveBeenCalledWith('company:c1');
      const emitFn = mockServer.to.mock.results[0].value.emit;
      expect(emitFn).toHaveBeenCalledWith(
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
      const client = {
        handshake: { query: { companyId: 'c1' } },
      } as unknown as Socket;

      const result = gateway.handlePositionUpdate(
        { technicianId: 't1', lat: 0, lng: 0 },
        client,
      );

      expect(result).toEqual({ event: 'position:ack', data: { received: true } });
    });

    it('should not broadcast when companyId is missing', () => {
      const client = {
        handshake: { query: {} },
      } as unknown as Socket;

      gateway.handlePositionUpdate(
        { technicianId: 't1', lat: 0, lng: 0 },
        client,
      );

      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });
});
