import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RoutesService', () => {
  let service: RoutesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      route: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
  });

  it('should create a route', async () => {
    const dto = {
      technicianId: 't1',
      date: '2025-01-15',
      waypoints: [{ lat: 40.7, lng: -74.0 }],
      estimatedDuration: 120,
    };
    prisma.route.create.mockResolvedValue({ id: 'r1', ...dto });
    const result = await service.create(dto as any);
    expect(result.id).toBe('r1');
  });

  it('should find routes by technician', async () => {
    prisma.route.findMany.mockResolvedValue([{ id: 'r1', technicianId: 't1' }]);
    const result = await service.findByTechnician('t1');
    expect(result).toHaveLength(1);
  });

  it('should find routes by technician and date', async () => {
    prisma.route.findMany.mockResolvedValue([{ id: 'r1' }]);
    await service.findByTechnician('t1', '2025-01-15');
    expect(prisma.route.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          technicianId: 't1',
          date: expect.any(Date),
        }),
      }),
    );
  });

  it('should find one route', async () => {
    prisma.route.findUnique.mockResolvedValue({ id: 'r1', technicianId: 't1' });
    const result = await service.findOne('r1');
    expect(result.id).toBe('r1');
  });

  it('should throw NotFoundException for missing route', async () => {
    prisma.route.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should delete a route', async () => {
    prisma.route.findUnique.mockResolvedValue({ id: 'r1' });
    prisma.route.delete.mockResolvedValue({ id: 'r1' });
    await service.remove('r1');
    expect(prisma.route.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });

  it('should default optimizedOrder to empty array', async () => {
    const dto = {
      technicianId: 't1',
      date: '2025-01-15',
      waypoints: [{ lat: 40.7, lng: -74.0 }],
      estimatedDuration: 60,
    };
    prisma.route.create.mockResolvedValue({ id: 'r1', optimizedOrder: [] });
    await service.create(dto as any);
    expect(prisma.route.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ optimizedOrder: [] }),
      }),
    );
  });
});
