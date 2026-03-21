import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsService } from './gps.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GpsService', () => {
  let service: GpsService;
  let prisma: {
    gpsEvent: {
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      gpsEvent: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    };
    service = new GpsService(prisma as unknown as PrismaService);
  });

  it('should find GPS events by technician', async () => {
    prisma.gpsEvent.findMany.mockResolvedValue([]);
    const result = await service.findByTechnician('tech-1', 'company-1');
    expect(prisma.gpsEvent.findMany).toHaveBeenCalledWith({
      where: { technicianId: 'tech-1', companyId: 'company-1' },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    expect(result).toEqual([]);
  });

  it('should create a GPS event', async () => {
    const dto = { latitude: 40.7128, longitude: -74.006, timestamp: '2026-03-21T10:00:00Z', technicianId: 'tech-1' };
    prisma.gpsEvent.create.mockResolvedValue({ id: 'gps-1', ...dto, companyId: 'company-1' });
    const result = await service.create(dto, 'company-1');
    expect(result.id).toBe('gps-1');
  });
});
