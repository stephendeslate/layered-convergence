import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../dashboard.service';
import { PrismaService } from '../../prisma.service';

// TRACED: AE-TA-UNIT-002 — Dashboard service unit tests
describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    setTenantContext: jest.Mock;
    dashboard: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      setTenantContext: jest.fn(),
      dashboard: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DashboardService);
  });

  it('should set tenant context before findAll', async () => {
    await service.findAll('tenant-1');
    expect(prisma.setTenantContext).toHaveBeenCalledWith('tenant-1');
    expect(prisma.dashboard.findMany).toHaveBeenCalled();
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing-id', 'tenant-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should create dashboard with slugified name', async () => {
    prisma.dashboard.create.mockResolvedValue({
      id: '1',
      name: 'My Dashboard',
      slug: 'my-dashboard',
    });

    const result = await service.create('My Dashboard', 'desc', 'tenant-1', 'user-1');
    expect(prisma.dashboard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'my-dashboard' }),
      }),
    );
    expect(result.slug).toBe('my-dashboard');
  });
});
