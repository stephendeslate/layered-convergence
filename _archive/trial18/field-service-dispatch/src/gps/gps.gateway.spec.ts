import { Test, TestingModule } from '@nestjs/testing';
import { GpsGateway } from './gps.gateway.js';
import { Socket, Server } from 'socket.io';

describe('GpsGateway', () => {
  let gateway: GpsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GpsGateway],
    }).compile();

    gateway = module.get<GpsGateway>(GpsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join the company room when companyId is provided', () => {
      const mockClient = {
        handshake: { query: { companyId: 'co-1' } },
        join: vi.fn(),
      } as unknown as Socket;

      gateway.handleConnection(mockClient);
      expect(mockClient.join).toHaveBeenCalledWith('company:co-1');
    });

    it('should not join any room when companyId is missing', () => {
      const mockClient = {
        handshake: { query: {} },
        join: vi.fn(),
      } as unknown as Socket;

      gateway.handleConnection(mockClient);
      expect(mockClient.join).not.toHaveBeenCalled();
    });

    it('should not join when companyId is an array', () => {
      const mockClient = {
        handshake: { query: { companyId: ['co-1', 'co-2'] } },
        join: vi.fn(),
      } as unknown as Socket;

      gateway.handleConnection(mockClient);
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect without errors', () => {
      const mockClient = {} as unknown as Socket;
      expect(() => gateway.handleDisconnect(mockClient)).not.toThrow();
    });
  });

  describe('handlePositionUpdate', () => {
    it('should broadcast position to company room', () => {
      const mockEmit = vi.fn();
      const mockServer = {
        to: vi.fn().mockReturnValue({ emit: mockEmit }),
      } as unknown as Server;
      gateway.server = mockServer;

      const mockClient = {
        handshake: { query: { companyId: 'co-1' } },
      } as unknown as Socket;

      const data = { technicianId: 'tech-1', lat: 40.7128, lng: -74.006 };
      const result = gateway.handlePositionUpdate(data, mockClient);

      expect(mockServer.to).toHaveBeenCalledWith('company:co-1');
      expect(mockEmit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({
          technicianId: 'tech-1',
          lat: 40.7128,
          lng: -74.006,
        }),
      );
      expect(result).toEqual({
        event: 'position:ack',
        data: { received: true },
      });
    });

    it('should not broadcast when no companyId', () => {
      const mockServer = {
        to: vi.fn(),
      } as unknown as Server;
      gateway.server = mockServer;

      const mockClient = {
        handshake: { query: {} },
      } as unknown as Socket;

      const data = { technicianId: 'tech-1', lat: 40.7128, lng: -74.006 };
      gateway.handlePositionUpdate(data, mockClient);

      expect(mockServer.to).not.toHaveBeenCalled();
    });

    it('should include timestamp in broadcast', () => {
      const mockEmit = vi.fn();
      const mockServer = {
        to: vi.fn().mockReturnValue({ emit: mockEmit }),
      } as unknown as Server;
      gateway.server = mockServer;

      const mockClient = {
        handshake: { query: { companyId: 'co-1' } },
      } as unknown as Socket;

      const data = { technicianId: 'tech-1', lat: 40.0, lng: -74.0 };
      gateway.handlePositionUpdate(data, mockClient);

      expect(mockEmit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });

    it('should return ack even when no companyId', () => {
      const mockServer = {
        to: vi.fn(),
      } as unknown as Server;
      gateway.server = mockServer;

      const mockClient = {
        handshake: { query: {} },
      } as unknown as Socket;

      const data = { technicianId: 'tech-1', lat: 40.0, lng: -74.0 };
      const result = gateway.handlePositionUpdate(data, mockClient);

      expect(result).toEqual({
        event: 'position:ack',
        data: { received: true },
      });
    });
  });
});
