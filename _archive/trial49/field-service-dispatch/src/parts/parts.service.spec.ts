import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PartsService', () => {
  let service: PartsService;
  let prisma: any;
  const companyId = 'company-1';

  beforeEach(async () => {
    prisma = {
      part: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      workOrder: {
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PartsService>(PartsService);
  });

  describe('create', () => {
    it('should create a part', async () => {
      const dto = { workOrderId: 'wo1', name: 'Filter', partNumber: 'F-100' };
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
      prisma.part.create.mockResolvedValue({ id: 'p1', ...dto, quantity: 1 });

      const result = await service.create(companyId, dto);
      expect(result.id).toBe('p1');
      expect(result.name).toBe('Filter');
    });

    it('should throw NotFoundException if work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(
        service.create(companyId, { workOrderId: 'missing', name: 'Part' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should pass quantity and unitCost to create', async () => {
      const dto = { workOrderId: 'wo1', name: 'Bolt', quantity: 5, unitCost: 2.5 };
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
      prisma.part.create.mockResolvedValue({ id: 'p1', ...dto });

      await service.create(companyId, dto);
      expect(prisma.part.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantity: 5, unitCost: 2.5 }),
        }),
      );
    });
  });

  describe('findByWorkOrder', () => {
    it('should find parts by work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
      prisma.part.findMany.mockResolvedValue([{ id: 'p1' }]);

      const result = await service.findByWorkOrder(companyId, 'wo1');
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException if work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(
        service.findByWorkOrder(companyId, 'missing'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should find one part', async () => {
      prisma.part.findUnique.mockResolvedValue({ id: 'p1', name: 'Filter' });
      const result = await service.findOne('p1');
      expect(result.name).toBe('Filter');
    });

    it('should throw NotFoundException for missing part', async () => {
      prisma.part.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a part', async () => {
      prisma.part.findUnique.mockResolvedValue({
        id: 'p1', workOrder: { companyId },
      });
      prisma.part.update.mockResolvedValue({ id: 'p1', installed: true });

      const result = await service.update(companyId, 'p1', { installed: true });
      expect(result.installed).toBe(true);
    });

    it('should throw NotFoundException for missing part', async () => {
      prisma.part.findUnique.mockResolvedValue(null);
      await expect(
        service.update(companyId, 'missing', { installed: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for wrong company', async () => {
      prisma.part.findUnique.mockResolvedValue({
        id: 'p1', workOrder: { companyId: 'other-company' },
      });
      await expect(
        service.update(companyId, 'p1', { installed: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a part', async () => {
      prisma.part.findUnique.mockResolvedValue({
        id: 'p1', workOrder: { companyId },
      });
      prisma.part.delete.mockResolvedValue({ id: 'p1' });

      const result = await service.remove(companyId, 'p1');
      expect(result.id).toBe('p1');
    });

    it('should throw NotFoundException for wrong company on delete', async () => {
      prisma.part.findUnique.mockResolvedValue({
        id: 'p1', workOrder: { companyId: 'other-company' },
      });
      await expect(
        service.remove(companyId, 'p1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
