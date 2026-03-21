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
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      const existing = { id: 'tech-1', companyId: 'company-1' };
      mockPrisma.technician.findFirst.mockResolvedValue(existing);
      mockPrisma.technician.delete.mockResolvedValue(existing);

      const result = await service.remove('tech-1', 'company-1');
      expect(result).toEqual(existing);
    });
  });
});
