import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from '../src/dashboards/dashboards.service';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED:AE-TEST-002
describe('DashboardsService', () => {
  let service: DashboardsService;
  let prisma: {
    dashboard: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardsService>(DashboardsService);
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const dto = { name: 'Test', tenantId: 'tenant-1' };
      prisma.dashboard.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto, 'user-1');
      expect(prisma.dashboard.create).toHaveBeenCalled();
      expect(result.id).toBe('1');
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards', async () => {
      prisma.dashboard.findMany.mockResolvedValue([{ id: '1' }]);
      prisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', name: 'Test' });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1' });
      prisma.dashboard.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1' });
      prisma.dashboard.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });
  });
});
