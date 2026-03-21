import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  technician: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

const COMPANY_ID = 'company-1';

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
    it('should create a technician with companyId', async () => {
      const dto = { name: 'John', email: 'john@test.com', lat: 40.7, lng: -74.0, skills: ['plumbing'] };
      const expected = { id: '1', ...dto, companyId: COMPANY_ID };
      mockPrisma.technician.create.mockResolvedValue(expected);

      const result = await service.create(COMPANY_ID, dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.technician.create).toHaveBeenCalledWith({
        data: { ...dto, companyId: COMPANY_ID },
      });
    });

    it('should include optional phone field', async () => {
      const dto = { name: 'Jane', email: 'jane@test.com', lat: 40.7, lng: -74.0, skills: ['electrical'], phone: '555-0100' };
      mockPrisma.technician.create.mockResolvedValue({ id: '2', ...dto, companyId: COMPANY_ID });

      await service.create(COMPANY_ID, dto);
      expect(mockPrisma.technician.create).toHaveBeenCalledWith({
        data: { ...dto, companyId: COMPANY_ID },
      });
    });
  });

  describe('findAll', () => {
    it('should return all technicians for a company', async () => {
      const techs = [{ id: '1', name: 'John', companyId: COMPANY_ID }];
      mockPrisma.technician.findMany.mockResolvedValue(techs);

      const result = await service.findAll(COMPANY_ID);
      expect(result).toEqual(techs);
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({
        where: { companyId: COMPANY_ID },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no technicians', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);
      const result = await service.findAll(COMPANY_ID);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a technician by id and companyId', async () => {
      const tech = { id: '1', name: 'John', companyId: COMPANY_ID };
      mockPrisma.technician.findFirst.mockResolvedValue(tech);

      const result = await service.findOne('1', COMPANY_ID);
      expect(result).toEqual(tech);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });

    it('should scope query by companyId', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
      await service.findOne('1', COMPANY_ID);
      expect(mockPrisma.technician.findFirst).toHaveBeenCalledWith({
        where: { id: '1', companyId: COMPANY_ID },
      });
    });
  });

  describe('update', () => {
    it('should update a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1', companyId: COMPANY_ID });
      mockPrisma.technician.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', COMPANY_ID, { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw if technician not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.update('bad', COMPANY_ID, { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.technician.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', COMPANY_ID);
      expect(result.id).toBe('1');
    });

    it('should throw if technician not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAvailable', () => {
    it('should return available technicians', async () => {
      const techs = [{ id: '1', availability: 'AVAILABLE' }];
      mockPrisma.technician.findMany.mockResolvedValue(techs);

      const result = await service.findAvailable(COMPANY_ID);
      expect(result).toEqual(techs);
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({
        where: { companyId: COMPANY_ID, availability: 'AVAILABLE' },
      });
    });
  });

  describe('updateLocation', () => {
    it('should update technician location', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1', lat: 0, lng: 0 });
      mockPrisma.technician.update.mockResolvedValue({ id: '1', lat: 40.7, lng: -74.0 });

      const result = await service.updateLocation('1', COMPANY_ID, 40.7, -74.0);
      expect(result.lat).toBe(40.7);
      expect(result.lng).toBe(-74.0);
    });

    it('should throw if technician not found for location update', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.updateLocation('bad', COMPANY_ID, 0, 0)).rejects.toThrow(NotFoundException);
    });
  });
});
