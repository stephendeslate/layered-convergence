import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  technician: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('TechnicianService', () => {
  let service: TechnicianService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
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
    it('should create a technician', async () => {
      const dto = {
        companyId: 'company-1',
        name: 'John',
        email: 'john@example.com',
        skills: ['plumbing'],
      };
      const expected = { id: 'tech-1', ...dto };
      mockPrisma.technician.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
    });

    it('should pass dto directly to prisma create', async () => {
      const dto = {
        companyId: 'co-1',
        name: 'Jane',
        email: 'jane@test.com',
        skills: ['hvac', 'electrical'],
        phone: '555-1234',
      };
      mockPrisma.technician.create.mockResolvedValue({ id: 'tech-2', ...dto });

      await service.create(dto);
      expect(mockPrisma.technician.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAllByCompany', () => {
    it('should return technicians for a company', async () => {
      const expected = [{ id: 'tech-1', companyId: 'company-1' }];
      mockPrisma.technician.findMany.mockResolvedValue(expected);

      const result = await service.findAllByCompany('company-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
      });
    });

    it('should return empty array when no technicians exist', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);

      const result = await service.findAllByCompany('empty-co');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a technician scoped by company', async () => {
      const expected = { id: 'tech-1', companyId: 'company-1' };
      mockPrisma.technician.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('tech-1', 'company-1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findOne('no', 'co')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a technician', async () => {
      const existing = { id: 'tech-1', companyId: 'co-1', name: 'Old' };
      mockPrisma.technician.findFirst.mockResolvedValue(existing);
      const updated = { ...existing, name: 'New' };
      mockPrisma.technician.update.mockResolvedValue(updated);

      const result = await service.update('tech-1', 'co-1', { name: 'New' });
      expect(result.name).toBe('New');
    });
  });

  describe('updatePosition', () => {
    it('should update technician GPS position', async () => {
      const existing = { id: 'tech-1', companyId: 'company-1' };
      mockPrisma.technician.findFirst.mockResolvedValue(existing);
      const updated = { ...existing, currentLat: 40.7128, currentLng: -74.006 };
      mockPrisma.technician.update.mockResolvedValue(updated);

      const result = await service.updatePosition('tech-1', 'company-1', 40.7128, -74.006);
      expect(result.currentLat).toBe(40.7128);
      expect(result.currentLng).toBe(-74.006);
    });

    it('should throw NotFoundException if technician not found for position update', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.updatePosition('no', 'co', 40.0, -74.0),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      const existing = { id: 'tech-1', companyId: 'company-1' };
      mockPrisma.technician.findFirst.mockResolvedValue(existing);
      mockPrisma.technician.delete.mockResolvedValue(existing);

      const result = await service.remove('tech-1', 'company-1');
      expect(result).toEqual(existing);
    });

    it('should throw NotFoundException when removing nonexistent technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.remove('no', 'co')).rejects.toThrow(NotFoundException);
    });
  });
});
