import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:TS-004] Unit test for DashboardService with mocked dependencies
describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };
  let tenantContext: { setTenantContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantContext = { setTenantContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should list dashboards for a tenant', async () => {
    prisma.dashboard.findMany.mockResolvedValue([{ id: 'd-1', title: 'Sales' }]);
    const result = await service.findAll('tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a dashboard', async () => {
    prisma.dashboard.create.mockResolvedValue({ id: 'd-1', title: 'Revenue' });
    const result = await service.create({
      title: 'Revenue',
      tenantId: 'tenant-1',
      ownerId: 'user-1',
    });
    expect(result.title).toBe('Revenue');
  });
});
