// TRACED: AE-TEST-002 — Dashboards service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from '../dashboards.service';
import { PrismaService } from '../../prisma.service';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let prisma: {
    dashboard: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
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
    it('should create a dashboard with generated ID', async () => {
      prisma.dashboard.create.mockResolvedValue({ id: 'dash_abc12345', name: 'Test' });

      const result = await service.create('tenant-1', 'user-1', { name: 'Test' });

      expect(result.id).toBeDefined();
      const createArg = prisma.dashboard.create.mock.calls[0][0];
      expect(createArg.data.id).toMatch(/^dash_/);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.dashboard.findMany.mockResolvedValue([{ id: '1', name: 'Dash 1' }]);
      prisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return dashboard with widgets', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', name: 'Dash', widgets: [] });

      const result = await service.findOne('tenant-1', '1');

      expect(result.name).toBe('Dash');
    });

    it('should throw NotFoundException when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
