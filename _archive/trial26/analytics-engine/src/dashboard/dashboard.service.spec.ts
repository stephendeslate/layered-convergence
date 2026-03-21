import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a dashboard', async () => {
    prisma.dashboard.create.mockResolvedValue({ id: 'd1', name: 'Test' });
    const result = await service.create('t1', { name: 'Test' });
    expect(result.name).toBe('Test');
  });

  it('should create a dashboard with defaults', async () => {
    prisma.dashboard.create.mockResolvedValue({ id: 'd1', name: 'DB', isPublished: false });
    await service.create('t1', { name: 'DB' });
    expect(prisma.dashboard.create).toHaveBeenCalledWith({
      data: {
        tenantId: 't1',
        name: 'DB',
        layout: {},
        isPublished: false,
      },
    });
  });

  it('should find all dashboards by tenant', async () => {
    prisma.dashboard.findMany.mockResolvedValue([{ id: 'd1' }]);
    const result = await service.findAll('t1');
    expect(result).toHaveLength(1);
  });

  it('should find one dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', name: 'DB' });
    const result = await service.findOne('t1', 'd1');
    expect(result.id).toBe('d1');
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad')).rejects.toThrow(NotFoundException);
  });

  it('should update a dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', name: 'Old' });
    prisma.dashboard.update.mockResolvedValue({ id: 'd1', name: 'New' });
    const result = await service.update('t1', 'd1', { name: 'New' });
    expect(result.name).toBe('New');
  });

  it('should delete a dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1' });
    prisma.dashboard.delete.mockResolvedValue({ id: 'd1' });
    await service.remove('t1', 'd1');
    expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
  });

  it('should throw NotFoundException when deleting non-existent dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.remove('t1', 'bad')).rejects.toThrow(NotFoundException);
  });
});
