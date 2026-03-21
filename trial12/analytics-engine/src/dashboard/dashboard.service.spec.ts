import { DashboardService } from './dashboard.service.js';
import { NotFoundException } from '@nestjs/common';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockPrisma: any;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockPrisma = {
      dashboard: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new DashboardService(mockPrisma);
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      mockPrisma.dashboard.create.mockResolvedValue({ id: '1', tenantId });
      const result = await service.create(tenantId, {
        name: 'Test',
        layout: {},
      });
      expect(result).toBeDefined();
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: { name: 'Test', layout: {}, tenantId },
      });
    });
  });

  describe('findAll', () => {
    it('should return dashboards for tenant', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      const result = await service.findAll(tenantId);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: '1',
        tenantId,
      });
      const result = await service.findOne(tenantId, '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.findOne(tenantId, 'x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: '1', tenantId });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: '1',
        name: 'Updated',
      });
      const result = await service.update(tenantId, '1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: '1', tenantId });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: '1' });
      await service.remove(tenantId, '1');
      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
