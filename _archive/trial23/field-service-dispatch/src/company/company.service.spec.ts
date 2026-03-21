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
      mockPrisma.company.create.mockResolvedValue({ id: '1', name: 'Test Co' });
      const result = await service.create({ name: 'Test Co' });
      expect(result.name).toBe('Test Co');
    });

    it('should pass all DTO fields to create', async () => {
      const dto = { name: 'Co', serviceArea: 'NYC', primaryColor: '#fff' };
      mockPrisma.company.create.mockResolvedValue({ id: '1', ...dto });
      await service.create(dto);
      expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      mockPrisma.company.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no companies', async () => {
      mockPrisma.company.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Test' });
      const result = await service.findOne('1');
      expect(result.name).toBe('Test');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Old' });
      mockPrisma.company.update.mockResolvedValue({ id: '1', name: 'New' });
      const result = await service.update('1', { name: 'New' });
      expect(result.name).toBe('New');
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.update('999', { name: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.company.delete.mockResolvedValue({ id: '1' });
      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
