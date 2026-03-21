import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GpsEventService } from './gps-event.service';

const mockPrisma = {
  gpsEvent: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
};

describe('GpsEventService', () => {
  let service: GpsEventService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GpsEventService(mockPrisma as never);
  });

  describe('findAll', () => {
    it('should return gps events for a company', async () => {
      const events = [{ id: '1', latitude: 40.7, longitude: -74.0 }];
      mockPrisma.gpsEvent.findMany.mockResolvedValue(events);

      const result = await service.findAll('c1');
      expect(result).toEqual(events);
    });
  });

  describe('findByTechnician', () => {
    it('should return events for a specific technician', async () => {
      const events = [{ id: '1', technicianId: 't1' }];
      mockPrisma.gpsEvent.findMany.mockResolvedValue(events);

      const result = await service.findByTechnician('t1', 'c1');
      expect(result).toEqual(events);
      expect(mockPrisma.gpsEvent.findMany).toHaveBeenCalledWith({
        where: { technicianId: 't1', companyId: 'c1' },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });
    });
  });

  describe('create', () => {
    it('should create a gps event with coordinates', async () => {
      const dto = { latitude: 40.7128, longitude: -74.006, timestamp: '2026-03-21T10:00:00Z', technicianId: 't1' };
      mockPrisma.gpsEvent.create.mockResolvedValue({ id: '1', ...dto, companyId: 'c1' });

      const result = await service.create(dto, 'c1');
      expect(result.latitude).toBe(40.7128);
    });
  });
});
