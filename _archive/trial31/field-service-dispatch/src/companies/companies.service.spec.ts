import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  company: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(CompaniesService);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a company', async () => {
      const dto = { name: 'Acme', slug: 'acme' };
      mockPrisma.company.create.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto);
      expect(result.name).toBe('Acme');
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      mockPrisma.company.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return company when found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Acme' });
      const result = await service.findOne('1');
      expect(result.name).toBe('Acme');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return company by slug', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1', slug: 'acme' });
      const result = await service.findBySlug('acme');
      expect(result.slug).toBe('acme');
    });

    it('should throw NotFoundException when slug not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.company.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.company.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('1');
      expect(result.id).toBe('1');
    });
  });
});
