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
      const dto = { name: 'ACME' };
      const result = { id: '1', ...dto };
      mockPrisma.company.create.mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const companies = [{ id: '1', name: 'ACME' }];
      mockPrisma.company.findMany.mockResolvedValue(companies);

      expect(await service.findAll()).toEqual(companies);
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      const company = { id: '1', name: 'ACME' };
      mockPrisma.company.findUnique.mockResolvedValue(company);

      expect(await service.findOne('1')).toEqual(company);
    });

    it('should throw NotFoundException when company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const company = { id: '1', name: 'ACME' };
      mockPrisma.company.findUnique.mockResolvedValue(company);
      const updated = { ...company, name: 'ACME Corp' };
      mockPrisma.company.update.mockResolvedValue(updated);

      expect(await service.update('1', { name: 'ACME Corp' })).toEqual(updated);
    });

    it('should throw NotFoundException on update if not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.update('999', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      const company = { id: '1', name: 'ACME' };
      mockPrisma.company.findUnique.mockResolvedValue(company);
      mockPrisma.company.delete.mockResolvedValue(company);

      expect(await service.remove('1')).toEqual(company);
    });

    it('should throw NotFoundException on remove if not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
