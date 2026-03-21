import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service.js';

const mockPrisma = {
  route: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('RouteService', () => {
  let service: RouteService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RouteService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a route', async () => {
      const dto = {
        technicianId: 't1',
        date: '2024-01-15',
        waypoints: [{ lat: 40.7, lng: -74.0 }],
        estimatedDuration: 120,
      };
      const result = { id: 'r1', ...dto };
      mockPrisma.route.create.mockResolvedValue(result);

      expect(await service.create(dto as any)).toEqual(result);
      expect(mockPrisma.route.create).toHaveBeenCalledWith({
        data: {
          technicianId: 't1',
          date: expect.any(Date),
          waypoints: dto.waypoints,
          estimatedDuration: 120,
        },
      });
    });
  });

  describe('findByTechnician', () => {
    it('should return routes ordered by date desc', async () => {
      mockPrisma.route.findMany.mockResolvedValue([]);

      expect(await service.findByTechnician('t1')).toEqual([]);
      expect(mockPrisma.route.findMany).toHaveBeenCalledWith({
        where: { technicianId: 't1' },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a route by id', async () => {
      const route = { id: 'r1' };
      mockPrisma.route.findUnique.mockResolvedValue(route);

      expect(await service.findOne('r1')).toEqual(route);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null);

      await expect(service.findOne('r999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('optimize', () => {
    it('should reverse waypoints and save as optimizedOrder', async () => {
      const waypoints = [
        { lat: 40.7, lng: -74.0, label: 'A' },
        { lat: 40.8, lng: -73.9, label: 'B' },
        { lat: 40.9, lng: -73.8, label: 'C' },
      ];
      mockPrisma.route.findUnique.mockResolvedValue({
        id: 'r1',
        waypoints,
      });
      mockPrisma.route.update.mockResolvedValue({ id: 'r1', optimizedOrder: [...waypoints].reverse() });

      const result = await service.optimize('r1');

      expect(mockPrisma.route.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: { optimizedOrder: [...waypoints].reverse() },
      });
      expect(result.optimizedOrder[0].label).toBe('C');
    });

    it('should throw NotFoundException for non-existent route', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null);

      await expect(service.optimize('r999')).rejects.toThrow(NotFoundException);
    });
  });
});
