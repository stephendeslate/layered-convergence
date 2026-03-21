import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../dashboard.service';
import { PrismaService } from '../../prisma.service';

// TRACED: AE-TST-DASH-001 — Dashboard service unit tests
describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock };
    setTenantContext: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated dashboards', async () => {
    prisma.dashboard.findMany.mockResolvedValue([
      { id: '1', name: 'Test', widgets: [] },
    ]);

    const result = await service.findAll('tenant-1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(prisma.setTenantContext).toHaveBeenCalledWith('tenant-1');
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);

    await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should create a dashboard', async () => {
    const expected = { id: '1', name: 'New Dashboard' };
    prisma.dashboard.create.mockResolvedValue(expected);

    const result = await service.create('tenant-1', 'user-1', 'New Dashboard');
    expect(result).toEqual(expected);
  });
});
