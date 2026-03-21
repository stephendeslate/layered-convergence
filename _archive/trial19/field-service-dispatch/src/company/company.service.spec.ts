import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

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
      const dto = { name: 'Acme Plumbing' };
      const expected = { id: 'uuid-1', ...dto, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.company.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const expected = [{ id: 'uuid-1', name: 'Co A' }, { id: 'uuid-2', name: 'Co B' }];
      mockPrisma.company.findMany.mockResolvedValue(expected);

      const result = await service.findAll();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      const expected = { id: 'uuid-1', name: 'Acme' };
      mockPrisma.company.findUnique.mockResolvedValue(expected);

      const result = await service.findOne('uuid-1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const existing = { id: 'uuid-1', name: 'Old' };
      const updated = { id: 'uuid-1', name: 'New' };
      mockPrisma.company.findUnique.mockResolvedValue(existing);
      mockPrisma.company.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { name: 'New' });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      const existing = { id: 'uuid-1', name: 'Acme' };
      mockPrisma.company.findUnique.mockResolvedValue(existing);
      mockPrisma.company.delete.mockResolvedValue(existing);

      const result = await service.remove('uuid-1');
      expect(result).toEqual(existing);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
