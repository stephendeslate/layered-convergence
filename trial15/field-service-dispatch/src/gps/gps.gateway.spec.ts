import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GpsGateway, GpsUpdatePayload } from './gps.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { Socket, Server } from 'socket.io';

const mockPrisma = {
  technician: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  gpsEvent: {
    create: vi.fn(),
  },
};

function createMockSocket(id = 'socket-1'): Socket {
  return {
    id,
    join: vi.fn(),
    leave: vi.fn(),
    emit: vi.fn(),
  } as unknown as Socket;
}

function createMockServer(): Server {
  const emit = vi.fn();
  return {
    to: vi.fn().mockReturnValue({ emit }),
    emit,
  } as unknown as Server;
}

describe('GpsGateway', () => {
  let gateway: GpsGateway;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsGateway,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    gateway = module.get<GpsGateway>(GpsGateway);
    gateway.server = createMockServer();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should track connected client', () => {
      const socket = createMockSocket('client-1');
      gateway.handleConnection(socket);
      expect(gateway.getConnectedClientsCount()).toBe(1);
    });

    it('should track multiple clients', () => {
      gateway.handleConnection(createMockSocket('client-1'));
      gateway.handleConnection(createMockSocket('client-2'));
      expect(gateway.getConnectedClientsCount()).toBe(2);
    });
  });

  describe('handleDisconnect', () => {
    it('should remove disconnected client', () => {
      const socket = createMockSocket('client-1');
      gateway.handleConnection(socket);
      gateway.handleDisconnect(socket);
      expect(gateway.getConnectedClientsCount()).toBe(0);
    });

    it('should only remove specific client', () => {
      const socket1 = createMockSocket('client-1');
      const socket2 = createMockSocket('client-2');
      gateway.handleConnection(socket1);
      gateway.handleConnection(socket2);
      gateway.handleDisconnect(socket1);
      expect(gateway.getConnectedClientsCount()).toBe(1);
    });
  });

  describe('handleGpsUpdate', () => {
    const validPayload: GpsUpdatePayload = {
      technicianId: 'tech-1',
      companyId: 'company-1',
      lat: 40.7128,
      lng: -74.006,
    };

    it('should process valid GPS update', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1', lat: 40.7128, lng: -74.006 });
      mockPrisma.gpsEvent.create.mockResolvedValue({
        id: 'gps-1',
        timestamp: new Date(),
      });

      const result = await gateway.handleGpsUpdate(validPayload, createMockSocket());
      expect(result).toEqual({
        event: 'gps:ack',
        data: { id: 'gps-1' },
      });
    });

    it('should update technician location', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.gpsEvent.create.mockResolvedValue({ id: 'gps-1', timestamp: new Date() });

      await gateway.handleGpsUpdate(validPayload, createMockSocket());
      expect(mockPrisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: { lat: 40.7128, lng: -74.006 },
      });
    });

    it('should create GPS event record', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.gpsEvent.create.mockResolvedValue({ id: 'gps-1', timestamp: new Date() });

      await gateway.handleGpsUpdate(validPayload, createMockSocket());
      expect(mockPrisma.gpsEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          lat: 40.7128,
          lng: -74.006,
          technicianId: 'tech-1',
          companyId: 'company-1',
        }),
      });
    });

    it('should broadcast position to company room', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.gpsEvent.create.mockResolvedValue({ id: 'gps-1', timestamp: new Date() });

      await gateway.handleGpsUpdate(validPayload, createMockSocket());
      expect(gateway.server.to).toHaveBeenCalledWith('company:company-1');
    });

    it('should return error for missing fields', async () => {
      const result = await gateway.handleGpsUpdate(
        { technicianId: '', companyId: '', lat: undefined as any, lng: undefined as any },
        createMockSocket(),
      );
      expect(result).toEqual({
        event: 'gps:error',
        data: { message: 'Missing required fields' },
      });
    });

    it('should return error when technician not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      const result = await gateway.handleGpsUpdate(validPayload, createMockSocket());
      expect(result).toEqual({
        event: 'gps:error',
        data: { message: 'Technician not found' },
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.technician.findFirst.mockRejectedValue(new Error('DB error'));

      const result = await gateway.handleGpsUpdate(validPayload, createMockSocket());
      expect(result).toEqual({
        event: 'gps:error',
        data: { message: 'DB error' },
      });
    });

    it('should accept custom timestamp', async () => {
      const timestamp = '2026-01-15T10:30:00Z';
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.gpsEvent.create.mockResolvedValue({ id: 'gps-1', timestamp: new Date(timestamp) });

      await gateway.handleGpsUpdate({ ...validPayload, timestamp }, createMockSocket());
      expect(mockPrisma.gpsEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          timestamp: new Date(timestamp),
        }),
      });
    });

    it('should verify technician belongs to company', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.gpsEvent.create.mockResolvedValue({ id: 'gps-1', timestamp: new Date() });

      await gateway.handleGpsUpdate(validPayload, createMockSocket());
      expect(mockPrisma.technician.findFirst).toHaveBeenCalledWith({
        where: { id: 'tech-1', companyId: 'company-1' },
      });
    });
  });

  describe('handleSubscribe', () => {
    it('should join company room', () => {
      const socket = createMockSocket();
      const result = gateway.handleSubscribe({ companyId: 'company-1' }, socket);
      expect(socket.join).toHaveBeenCalledWith('company:company-1');
      expect(result).toEqual({
        event: 'gps:subscribed',
        data: { companyId: 'company-1' },
      });
    });

    it('should return error when companyId missing', () => {
      const socket = createMockSocket();
      const result = gateway.handleSubscribe({ companyId: '' }, socket);
      expect(result).toEqual({
        event: 'gps:error',
        data: { message: 'companyId is required' },
      });
    });
  });

  describe('handleUnsubscribe', () => {
    it('should leave company room', () => {
      const socket = createMockSocket();
      const result = gateway.handleUnsubscribe({ companyId: 'company-1' }, socket);
      expect(socket.leave).toHaveBeenCalledWith('company:company-1');
      expect(result).toEqual({
        event: 'gps:unsubscribed',
        data: { companyId: 'company-1' },
      });
    });

    it('should return error when companyId missing', () => {
      const socket = createMockSocket();
      const result = gateway.handleUnsubscribe({ companyId: '' }, socket);
      expect(result).toEqual({
        event: 'gps:error',
        data: { message: 'companyId is required' },
      });
    });
  });

  describe('getConnectedClientsCount', () => {
    it('should return 0 when no clients connected', () => {
      expect(gateway.getConnectedClientsCount()).toBe(0);
    });

    it('should return correct count', () => {
      gateway.handleConnection(createMockSocket('c1'));
      gateway.handleConnection(createMockSocket('c2'));
      gateway.handleConnection(createMockSocket('c3'));
      expect(gateway.getConnectedClientsCount()).toBe(3);
    });
  });
});
