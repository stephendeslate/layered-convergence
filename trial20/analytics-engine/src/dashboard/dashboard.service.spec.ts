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
  let tenantCtx: { setContext: jest.Mock };

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
    tenantCtx = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantCtx },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should find all dashboards for a tenant', async () => {
    prisma.dashboard.findMany.mockResolvedValue([{ id: '1', name: 'Main' }]);
    const result = await service.findAll('tenant-1');
    expect(tenantCtx.setContext).toHaveBeenCalledWith('tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException for missing dashboard', async () => {
    prisma.dashboard.findUnique.mockResolvedValue(null);
    await expect(service.findById('bad', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a dashboard', async () => {
    prisma.dashboard.create.mockResolvedValue({ id: '1', name: 'New', tenantId: 'tenant-1' });
    const result = await service.create({ name: 'New' }, 'tenant-1');
    expect(result.name).toBe('New');
  });

  it('should update a dashboard', async () => {
    prisma.dashboard.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    prisma.dashboard.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await service.update('1', { name: 'Updated' }, 'tenant-1');
    expect(result.name).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    prisma.dashboard.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    prisma.dashboard.delete.mockResolvedValue({ id: '1' });
    await service.delete('1', 'tenant-1');
    expect(prisma.dashboard.delete).toHaveBeenCalled();
  });
});
