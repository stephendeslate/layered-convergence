import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransformationsService } from './transformations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransformationsService', () => {
  let service: TransformationsService;
  let prisma: any;

  const mockTransform = {
    id: 'tr-1',
    name: 'Flatten JSON',
    type: 'flatten',
    config: {},
    order: 0,
    dataSourceId: 'ds-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      transformation: {
        findMany: vi.fn().mockResolvedValue([mockTransform]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockTransform),
        update: vi.fn().mockResolvedValue(mockTransform),
        delete: vi.fn().mockResolvedValue(mockTransform),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        TransformationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransformationsService>(TransformationsService);
  });

  describe('findAll', () => {
    it('should return transformations ordered by order', async () => {
      await service.findAll('ds-1');
      expect(prisma.transformation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { order: 'asc' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return transformation by id', async () => {
      prisma.transformation.findUnique.mockResolvedValue(mockTransform);
      const result = await service.findOne('tr-1');
      expect(result).toEqual(mockTransform);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.transformation.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a transformation', async () => {
      await service.create({ name: 'New', type: 'cast', dataSourceId: 'ds-1' });
      expect(prisma.transformation.create).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a transformation', async () => {
      await service.remove('tr-1');
      expect(prisma.transformation.delete).toHaveBeenCalledWith({ where: { id: 'tr-1' } });
    });
  });
});
