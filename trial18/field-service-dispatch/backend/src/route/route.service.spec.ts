import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: {
    route: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      route: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };
    service = new RouteService(prisma as unknown as PrismaService);
  });

  it('should find all routes for a company', async () => {
    prisma.route.findMany.mockResolvedValue([]);
    const result = await service.findAll('company-1');
    expect(result).toEqual([]);
  });

  it('should throw NotFoundException if route not found', async () => {
    prisma.route.findFirst.mockResolvedValue(null);
    await expect(service.findById('route-1', 'company-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a route', async () => {
    const dto = { name: 'Morning Route', date: '2026-03-21', distance: 25.5, technicianId: 'tech-1' };
    prisma.route.create.mockResolvedValue({ id: 'route-1', ...dto, companyId: 'company-1' });
    const result = await service.create(dto, 'company-1');
    expect(result.id).toBe('route-1');
  });
});
