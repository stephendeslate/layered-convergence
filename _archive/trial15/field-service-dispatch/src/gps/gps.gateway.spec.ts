import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { GpsGateway } from './gps.gateway.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  technician: {
    update: vi.fn(),
  },
};

describe('GpsGateway', () => {
  let gateway: GpsGateway;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        GpsGateway,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    gateway = module.get<GpsGateway>(GpsGateway);
    gateway.server = { emit: vi.fn() } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handlePositionUpdate', () => {
    const positionData = {
      technicianId: 'tech-1',
      lat: 40.7128,
      lng: -74.006,
    };

    const mockClient = { id: 'socket-1' } as any;

    it('should update technician position in database', async () => {
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1' });

      await gateway.handlePositionUpdate(positionData, mockClient);
      expect(mockPrisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: {
          currentLat: 40.7128,
          currentLng: -74.006,
        },
      });
    });

    it('should broadcast position:updated event to all clients', async () => {
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1' });

      await gateway.handlePositionUpdate(positionData, mockClient);
      expect(gateway.server.emit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({
          technicianId: 'tech-1',
          lat: 40.7128,
          lng: -74.006,
        }),
      );
    });

    it('should include timestamp in broadcast', async () => {
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1' });

      await gateway.handlePositionUpdate(positionData, mockClient);
      expect(gateway.server.emit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });

    it('should return success acknowledgement', async () => {
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-1' });

      const result = await gateway.handlePositionUpdate(positionData, mockClient);
      expect(result).toEqual({
        event: 'position:updated',
        data: { success: true },
      });
    });

    it('should handle different coordinates', async () => {
      const data = { technicianId: 'tech-2', lat: 34.0522, lng: -118.2437 };
      mockPrisma.technician.update.mockResolvedValue({ id: 'tech-2' });

      await gateway.handlePositionUpdate(data, mockClient);
      expect(mockPrisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-2' },
        data: {
          currentLat: 34.0522,
          currentLng: -118.2437,
        },
      });
    });

    it('should propagate database errors', async () => {
      mockPrisma.technician.update.mockRejectedValue(new Error('DB error'));

      await expect(
        gateway.handlePositionUpdate(positionData, mockClient),
      ).rejects.toThrow('DB error');
    });
  });
});
