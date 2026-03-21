import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      company: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new CompaniesService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a company', async () => {
      const dto = { name: 'Test Co', slug: 'test-co' };
      const expected = { id: 'c-1', ...dto };
      prisma.company.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(prisma.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Test Co', slug: 'test-co' }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const companies = [{ id: 'c-1' }, { id: 'c-2' }];
      prisma.company.findMany.mockResolvedValue(companies);

      const result = await service.findAll();
      expect(result).toEqual(companies);
      expect(prisma.company.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      const company = { id: 'c-1', name: 'Test' };
      prisma.company.findUnique.mockResolvedValue(company);

      const result = await service.findOne('c-1');
      expect(result).toEqual(company);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a company by slug', async () => {
      const company = { id: 'c-1', slug: 'test-co' };
      prisma.company.findUnique.mockResolvedValue(company);

      const result = await service.findBySlug('test-co');
      expect(result).toEqual(company);
    });

    it('should throw NotFoundException if slug not found', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: 'c-1' });
      prisma.company.update.mockResolvedValue({ id: 'c-1', name: 'Updated' });

      const result = await service.update('c-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if company does not exist', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(service.update('nope', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a company', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: 'c-1' });
      prisma.company.delete.mockResolvedValue({ id: 'c-1' });

      const result = await service.delete('c-1');
      expect(result.id).toBe('c-1');
    });

    it('should throw NotFoundException if company does not exist', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(service.delete('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
