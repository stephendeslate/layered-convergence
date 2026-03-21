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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a company', async () => {
      mockPrisma.company.create.mockResolvedValue({
        id: '1',
        name: 'Test',
        slug: 'test',
      });
      const result = await service.create({ name: 'Test', slug: 'test' });
      expect(result.name).toBe('Test');
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
    it('should return a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Test' });
      const result = await service.findOne('1');
      expect(result.name).toBe('Test');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return company by slug', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1', slug: 'test' });
      const result = await service.findBySlug('test');
      expect(result.slug).toBe('test');
    });

    it('should throw NotFoundException for unknown slug', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.company.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.company.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('1');
      expect(result.id).toBe('1');
    });
  });
});
