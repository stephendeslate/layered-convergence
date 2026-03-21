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

  it('should create a company', async () => {
    const dto = { name: 'Test Corp' };
    const expected = { id: '1', ...dto };
    mockPrisma.company.create.mockResolvedValue(expected);

    const result = await service.create(dto);
    expect(result).toEqual(expected);
    expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should find all companies', async () => {
    const expected = [{ id: '1', name: 'Test' }];
    mockPrisma.company.findMany.mockResolvedValue(expected);

    const result = await service.findAll();
    expect(result).toEqual(expected);
  });

  it('should find one company', async () => {
    const expected = { id: '1', name: 'Test' };
    mockPrisma.company.findUniqueOrThrow.mockResolvedValue(expected);

    const result = await service.findOne('1');
    expect(result).toEqual(expected);
    expect(mockPrisma.company.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should update a company', async () => {
    const dto = { name: 'Updated' };
    const expected = { id: '1', ...dto };
    mockPrisma.company.update.mockResolvedValue(expected);

    const result = await service.update('1', dto);
    expect(result).toEqual(expected);
  });

  it('should delete a company', async () => {
    mockPrisma.company.delete.mockResolvedValue({ id: '1' });

    const result = await service.remove('1');
    expect(result).toEqual({ id: '1' });
  });
});
