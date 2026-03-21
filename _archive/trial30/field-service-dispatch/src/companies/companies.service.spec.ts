import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
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
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CompaniesService>(CompaniesService);
  });

  describe('create', () => {
    it('should create a company', async () => {
      const dto = { name: 'ACME', slug: 'acme' };
      mockPrisma.company.create.mockResolvedValue({ id: 'c1', ...dto });
      const result = await service.create(dto);
      expect(result.name).toBe('ACME');
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      mockPrisma.company.findMany.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return company when found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1', name: 'ACME' });
      const result = await service.findOne('c1');
      expect(result.name).toBe('ACME');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findOne('c999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return company by slug', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1', slug: 'acme' });
      const result = await service.findBySlug('acme');
      expect(result.slug).toBe('acme');
    });

    it('should throw NotFoundException for unknown slug', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1' });
      mockPrisma.company.update.mockResolvedValue({ id: 'c1', name: 'Updated' });
      const result = await service.update('c1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1' });
      mockPrisma.company.delete.mockResolvedValue({ id: 'c1' });
      const result = await service.delete('c1');
      expect(result.id).toBe('c1');
    });
  });
});
