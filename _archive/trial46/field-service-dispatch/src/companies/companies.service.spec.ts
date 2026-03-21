import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      company: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should create a company', async () => {
    const dto = { name: 'Acme HVAC', slug: 'acme-hvac' };
    prisma.company.create.mockResolvedValue({ id: '1', ...dto });
    const result = await service.create(dto);
    expect(result.name).toBe(dto.name);
    expect(prisma.company.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should find all companies', async () => {
    prisma.company.findMany.mockResolvedValue([{ id: '1', name: 'Test' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find one company by id', async () => {
    prisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Test' });
    const result = await service.findOne('1');
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException when company not found', async () => {
    prisma.company.findUnique.mockResolvedValue(null);
    await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should update a company', async () => {
    prisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Old' });
    prisma.company.update.mockResolvedValue({ id: '1', name: 'New' });
    const result = await service.update('1', { name: 'New' });
    expect(result.name).toBe('New');
  });

  it('should delete a company', async () => {
    prisma.company.findUnique.mockResolvedValue({ id: '1' });
    prisma.company.delete.mockResolvedValue({ id: '1' });
    const result = await service.remove('1');
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException on update of nonexistent company', async () => {
    prisma.company.findUnique.mockResolvedValue(null);
    await expect(service.update('x', { name: 'Nope' })).rejects.toThrow(NotFoundException);
  });
});
