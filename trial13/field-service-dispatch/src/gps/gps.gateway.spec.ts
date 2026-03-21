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
    gateway.server = {
      emit: vi.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle position-update event and update technician GPS', async () => {
    const data = { technicianId: 'tech-1', lat: 40.7128, lng: -74.006 };
    const mockClient = { id: 'client-1' } as any;

    mockPrisma.technician.update.mockResolvedValue({
      id: 'tech-1',
      currentLat: 40.7128,
      currentLng: -74.006,
    });

    const result = await gateway.handlePositionUpdate(data, mockClient);

    expect(mockPrisma.technician.update).toHaveBeenCalledWith({
      where: { id: 'tech-1' },
      data: { currentLat: 40.7128, currentLng: -74.006 },
    });

    expect(result).toEqual({ event: 'position:updated', data: { success: true } });
  });

  it('should broadcast position to all connected clients', async () => {
    const data = { technicianId: 'tech-2', lat: 34.0522, lng: -118.2437 };
    const mockClient = { id: 'client-2' } as any;

    mockPrisma.technician.update.mockResolvedValue({});

    await gateway.handlePositionUpdate(data, mockClient);

    expect(gateway.server.emit).toHaveBeenCalledWith(
      'position:updated',
      expect.objectContaining({
        technicianId: 'tech-2',
        lat: 34.0522,
        lng: -118.2437,
        timestamp: expect.any(String),
      }),
    );
  });

  it('should include timestamp in broadcast', async () => {
    const data = { technicianId: 'tech-1', lat: 40.7128, lng: -74.006 };
    const mockClient = { id: 'client-1' } as any;

    mockPrisma.technician.update.mockResolvedValue({});

    await gateway.handlePositionUpdate(data, mockClient);

    const emitCall = (gateway.server.emit as any).mock.calls[0];
    expect(emitCall[1].timestamp).toBeDefined();
    expect(new Date(emitCall[1].timestamp).getTime()).not.toBeNaN();
  });

  it('should persist GPS coordinates to database', async () => {
    const data = { technicianId: 'tech-3', lat: 51.5074, lng: -0.1278 };
    const mockClient = { id: 'client-3' } as any;

    mockPrisma.technician.update.mockResolvedValue({});

    await gateway.handlePositionUpdate(data, mockClient);

    expect(mockPrisma.technician.update).toHaveBeenCalledWith({
      where: { id: 'tech-3' },
      data: { currentLat: 51.5074, currentLng: -0.1278 },
    });
  });

  it('should return success response to sender', async () => {
    const data = { technicianId: 'tech-1', lat: 40.7128, lng: -74.006 };
    const mockClient = { id: 'client-1' } as any;

    mockPrisma.technician.update.mockResolvedValue({});

    const result = await gateway.handlePositionUpdate(data, mockClient);
    expect(result.data.success).toBe(true);
  });

  it('should emit to position:updated channel', async () => {
    const data = { technicianId: 'tech-1', lat: 40.7128, lng: -74.006 };
    const mockClient = { id: 'client-1' } as any;

    mockPrisma.technician.update.mockResolvedValue({});

    await gateway.handlePositionUpdate(data, mockClient);

    expect(gateway.server.emit).toHaveBeenCalledWith('position:updated', expect.any(Object));
  });
});
