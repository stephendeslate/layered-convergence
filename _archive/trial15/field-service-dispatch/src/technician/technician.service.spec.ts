import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TechnicianService } from './technician.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  technician: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirstOrThrow: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
  },
};

describe('TechnicianService', () => {
  let service: TechnicianService;
  const companyId = 'company-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TechnicianService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TechnicianService>(TechnicianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a technician with companyId', async () => {
      const dto = { name: 'John', email: 'john@test.com', skills: ['plumbing'] };
      const expected = { id: 'tech-1', ...dto, companyId };
      mockPrisma.technician.create.mockResolvedValue(expected);

      const result = await service.create(companyId, dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.technician.create).toHaveBeenCalledWith({
        data: { ...dto, companyId },
      });
    });

    it('should create technician with optional phone', async () => {
      const dto = { name: 'John', email: 'john@test.com', skills: [], phone: '555-0100' };
      mockPrisma.technician.create.mockResolvedValue({ id: 'tech-1', ...dto });

      await service.create(companyId, dto);
      expect(mockPrisma.technician.create).toHaveBeenCalledWith({
        data: { ...dto, companyId },
      });
    });
  });

  describe('findAll', () => {
    it('should return technicians scoped by companyId', async () => {
      const expected = [{ id: 'tech-1' }, { id: 'tech-2' }];
      mockPrisma.technician.findMany.mockResolvedValue(expected);

      const result = await service.findAll(companyId);
      expect(result).toEqual(expected);
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({ where: { companyId } });
    });

    it('should return empty array when no technicians', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);

      const result = await service.findAll(companyId);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find technician scoped by companyId', async () => {
      const expected = { id: 'tech-1', companyId };
      mockPrisma.technician.findFirstOrThrow.mockResolvedValue(expected);

      const result = await service.findOne(companyId, 'tech-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.technician.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 'tech-1', companyId },
      });
    });
  });

  describe('update', () => {
    it('should update technician scoped by companyId', async () => {
      const dto = { name: 'Updated' };
      mockPrisma.technician.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.technician.findUniqueOrThrow.mockResolvedValue({ id: 'tech-1', name: 'Updated' });

      const result = await service.update(companyId, 'tech-1', dto);
      expect(result.name).toBe('Updated');
      expect(mockPrisma.technician.updateMany).toHaveBeenCalledWith({
        where: { id: 'tech-1', companyId },
        data: dto,
      });
    });

    it('should update technician status', async () => {
      const dto = { status: 'BUSY' as any };
      mockPrisma.technician.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.technician.findUniqueOrThrow.mockResolvedValue({ id: 'tech-1', status: 'BUSY' });

      const result = await service.update(companyId, 'tech-1', dto);
      expect(result.status).toBe('BUSY');
    });

    it('should update technician GPS coordinates', async () => {
      const dto = { currentLat: 40.7128, currentLng: -74.006 };
      mockPrisma.technician.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.technician.findUniqueOrThrow.mockResolvedValue({ id: 'tech-1', ...dto });

      const result = await service.update(companyId, 'tech-1', dto);
      expect(result.currentLat).toBe(40.7128);
    });
  });
});
