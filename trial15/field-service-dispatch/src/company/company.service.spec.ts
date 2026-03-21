import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  company: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a company', async () => {
      const dto = { name: 'Test Corp' };
      const expected = { id: '1', ...dto, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.company.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should pass dto correctly to prisma', async () => {
      const dto = { name: 'Another Corp' };
      mockPrisma.company.create.mockResolvedValue({ id: '2', ...dto });

      await service.create(dto);
      expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const companies = [
        { id: '1', name: 'Corp A' },
        { id: '2', name: 'Corp B' },
      ];
      mockPrisma.company.findMany.mockResolvedValue(companies);

      const result = await service.findAll();
      expect(result).toEqual(companies);
    });

    it('should order by createdAt desc', async () => {
      mockPrisma.company.findMany.mockResolvedValue([]);

      await service.findAll();
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no companies exist', async () => {
      mockPrisma.company.findMany.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      const company = { id: '1', name: 'Test Corp' };
      mockPrisma.company.findFirst.mockResolvedValue(company);

      const result = await service.findOne('1');
      expect(result).toEqual(company);
    });

    it('should throw NotFoundException when company not found', async () => {
      mockPrisma.company.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should use findFirst with id filter', async () => {
      mockPrisma.company.findFirst.mockResolvedValue({ id: '1', name: 'Test' });

      await service.findOne('1');
      expect(mockPrisma.company.findFirst).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const existing = { id: '1', name: 'Old Name' };
      const updated = { id: '1', name: 'New Name' };
      mockPrisma.company.findFirst.mockResolvedValue(existing);
      mockPrisma.company.update.mockResolvedValue(updated);

      const result = await service.update('1', { name: 'New Name' });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockPrisma.company.findFirst.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should call update with correct params', async () => {
      mockPrisma.company.findFirst.mockResolvedValue({ id: '1', name: 'Old' });
      mockPrisma.company.update.mockResolvedValue({ id: '1', name: 'New' });

      await service.update('1', { name: 'New' });
      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'New' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      const company = { id: '1', name: 'Test Corp' };
      mockPrisma.company.findFirst.mockResolvedValue(company);
      mockPrisma.company.delete.mockResolvedValue(company);

      const result = await service.remove('1');
      expect(result).toEqual(company);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockPrisma.company.findFirst.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should call delete with correct id', async () => {
      mockPrisma.company.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.company.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');
      expect(mockPrisma.company.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
