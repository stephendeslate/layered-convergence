import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service.js';

const mockPrisma = {
  company: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CompanyService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a company', async () => {
      const dto = { name: 'Test Co' };
      mockPrisma.company.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result.name).toBe('Test Co');
      expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      mockPrisma.company.findMany.mockResolvedValue([{ id: '1', name: 'Co' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Co' });
      const result = await service.findOne('1');
      expect(result.name).toBe('Co');
    });

    it('should throw NotFoundException when company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Co' });
      mockPrisma.company.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when updating non-existent company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.update('999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Co' });
      mockPrisma.company.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when deleting non-existent company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
