import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { CompanyService } from './company.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  company: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
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
      const dto = { name: 'ACME Corp' };
      const expected = { id: 'comp-1', ...dto };
      mockPrisma.company.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should create company with optional fields', async () => {
      const dto = { name: 'ACME Corp', branding: { color: 'blue' }, serviceArea: 'NYC' };
      mockPrisma.company.create.mockResolvedValue({ id: 'comp-1', ...dto });

      await service.create(dto);
      expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const expected = [{ id: 'comp-1' }, { id: 'comp-2' }];
      mockPrisma.company.findMany.mockResolvedValue(expected);

      const result = await service.findAll();
      expect(result).toEqual(expected);
      expect(mockPrisma.company.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no companies', async () => {
      mockPrisma.company.findMany.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find a company by id', async () => {
      const expected = { id: 'comp-1', name: 'ACME Corp' };
      mockPrisma.company.findUniqueOrThrow.mockResolvedValue(expected);

      const result = await service.findOne('comp-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.company.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'comp-1' },
      });
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const dto = { name: 'Updated Corp' };
      const expected = { id: 'comp-1', name: 'Updated Corp' };
      mockPrisma.company.update.mockResolvedValue(expected);

      const result = await service.update('comp-1', dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: 'comp-1' },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      mockPrisma.company.delete.mockResolvedValue({ id: 'comp-1' });

      const result = await service.remove('comp-1');
      expect(result).toEqual({ id: 'comp-1' });
      expect(mockPrisma.company.delete).toHaveBeenCalledWith({
        where: { id: 'comp-1' },
      });
    });
  });
});
