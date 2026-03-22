// TRACED:AE-TEST-03 — Dashboards service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let prisma: {
    dashboard: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a dashboard', async () => {
    const mockDashboard = {
      id: '1',
      title: 'Test Dashboard',
      isPublic: false,
      tenantId: 't1',
      userId: 'u1',
      createdAt: new Date(),
    };
    prisma.dashboard.create.mockResolvedValue(mockDashboard);

    const result = await service.create({
      title: 'Test Dashboard',
      tenantId: 't1',
      userId: 'u1',
    });

    expect(result).toEqual(mockDashboard);
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);

    await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should return paginated dashboards', async () => {
    prisma.dashboard.findMany.mockResolvedValue([]);
    prisma.dashboard.count.mockResolvedValue(0);

    const result = await service.findAll('t1', 1, 10);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });
});
