import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { NotFoundException } from '@nestjs/common';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };
  let tenantContext: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantContext = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should find all dashboards for a tenant', async () => {
    const dashboards = [{ id: '1', name: 'Main', tenantId: 't1' }];
    prisma.dashboard.findMany.mockResolvedValue(dashboards);

    const result = await service.findAll('t1');
    expect(result).toEqual(dashboards);
    expect(tenantContext.setContext).toHaveBeenCalledWith('t1');
  });

  it('should throw NotFoundException for non-existent dashboard', async () => {
    prisma.dashboard.findUnique.mockResolvedValue(null);

    await expect(service.findById('bad-id', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    prisma.dashboard.findUnique.mockResolvedValue({ id: '1', tenantId: 't2' });

    await expect(service.findById('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create a dashboard', async () => {
    const created = { id: '1', name: 'New', tenantId: 't1' };
    prisma.dashboard.create.mockResolvedValue(created);

    const result = await service.create({ name: 'New' }, 't1');
    expect(result).toEqual(created);
  });
});
