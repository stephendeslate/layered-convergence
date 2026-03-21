import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  dashboard: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;
  const tenantId = 'tenant-uuid-1';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(DashboardService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dashboard scoped to tenant', async () => {
      const dto = { name: 'Sales', layout: { columns: 2 } };
      mockPrisma.dashboard.create.mockResolvedValue({ id: '1', tenantId, ...dto });

      const result = await service.create(tenantId, dto);
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: { ...dto, tenantId },
      });
      expect(result.tenantId).toBe(tenantId);
    });
  });

  describe('findAll', () => {
    it('should return dashboards for a tenant with widgets', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([
        { id: '1', tenantId, widgets: [] },
      ]);

      const result = await service.findAll(tenantId);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { widgets: true },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by tenant and id', async () => {
      const dash = { id: 'd1', tenantId, widgets: [] };
      mockPrisma.dashboard.findFirst.mockResolvedValue(dash);

      const result = await service.findOne(tenantId, 'd1');
      expect(result).toEqual(dash);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'd1',
        name: 'Updated',
      });

      const result = await service.update(tenantId, 'd1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: 'd1' });

      const result = await service.remove(tenantId, 'd1');
      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'd1' },
      });
      expect(result).toBeDefined();
    });
  });
});
