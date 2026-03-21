import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  describe('create', () => {
    it('should create dashboard with tenantId', async () => {
      prisma.dashboard.create.mockResolvedValue({ id: 'd-1', tenantId: 't-1', name: 'Test' });
      const result = await service.create('t-1', { name: 'Test' });
      expect(result.tenantId).toBe('t-1');
    });

    it('should default isPublished to false', async () => {
      prisma.dashboard.create.mockResolvedValue({ id: 'd-1' });
      await service.create('t-1', { name: 'Test' });
      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isPublished: false }),
        }),
      );
    });

    it('should default layout to empty object', async () => {
      prisma.dashboard.create.mockResolvedValue({ id: 'd-1' });
      await service.create('t-1', { name: 'Test' });
      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ layout: {} }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return dashboards for tenant', async () => {
      prisma.dashboard.findMany.mockResolvedValue([{ id: 'd-1' }]);
      const result = await service.findAll('t-1');
      expect(result).toHaveLength(1);
    });

    it('should include widgets and embed', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      await service.findAll('t-1');
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { widgets: true, embed: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return dashboard by id and tenantId', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd-1', tenantId: 't-1' });
      const result = await service.findOne('t-1', 'd-1');
      expect(result.id).toBe('d-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.findOne('t-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd-1' });
      prisma.dashboard.update.mockResolvedValue({ id: 'd-1', name: 'Updated' });
      const result = await service.update('t-1', 'd-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if not found on update', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.update('t-1', 'missing', { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd-1' });
      prisma.dashboard.delete.mockResolvedValue({ id: 'd-1' });
      const result = await service.remove('t-1', 'd-1');
      expect(result.id).toBe('d-1');
    });

    it('should throw NotFoundException if not found on delete', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.remove('t-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
