import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TechnicianAvailability } from '@prisma/client';

describe('TechnicianService', () => {
  let service: TechnicianService;
  let prisma: {
    technician: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const companyId = 'company-1';

  const mockTechnician = {
    id: 'tech-1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-1234',
    skills: ['plumbing', 'electrical'],
    availability: TechnicianAvailability.AVAILABLE,
    latitude: 40.7128,
    longitude: -74.006,
    companyId,
    workOrders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      technician: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new TechnicianService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a technician with company association', async () => {
      prisma.technician.create.mockResolvedValue(mockTechnician);

      const result = await service.create(companyId, {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-1234',
        skills: ['plumbing', 'electrical'],
      });

      expect(result).toEqual(mockTechnician);
      expect(prisma.technician.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ companyId, name: 'John Smith' }),
        }),
      );
    });

    it('should default skills to empty array', async () => {
      prisma.technician.create.mockResolvedValue({ ...mockTechnician, skills: [] });

      await service.create(companyId, {
        name: 'Jane',
        email: 'jane@example.com',
      });

      expect(prisma.technician.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ skills: [] }),
        }),
      );
    });

    it('should handle optional phone field', async () => {
      prisma.technician.create.mockResolvedValue({ ...mockTechnician, phone: null });

      await service.create(companyId, {
        name: 'No Phone',
        email: 'nophone@example.com',
      });

      expect(prisma.technician.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ phone: undefined }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all technicians for company', async () => {
      prisma.technician.findMany.mockResolvedValue([mockTechnician]);

      const result = await service.findAll(companyId);

      expect(result).toHaveLength(1);
      expect(prisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId },
        }),
      );
    });

    it('should return empty array when no technicians exist', async () => {
      prisma.technician.findMany.mockResolvedValue([]);

      const result = await service.findAll(companyId);
      expect(result).toEqual([]);
    });

    it('should order by name ascending', async () => {
      prisma.technician.findMany.mockResolvedValue([]);

      await service.findAll(companyId);

      expect(prisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a technician with work orders', async () => {
      prisma.technician.findFirst.mockResolvedValue(mockTechnician);

      const result = await service.findById(companyId, 'tech-1');

      expect(result).toEqual(mockTechnician);
      expect(prisma.technician.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tech-1', companyId },
        }),
      );
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findById(companyId, 'bad')).rejects.toThrow(NotFoundException);
    });

    it('should not return technician from other company', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findById('other-company', 'tech-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update technician fields', async () => {
      prisma.technician.findFirst.mockResolvedValue(mockTechnician);
      prisma.technician.update.mockResolvedValue({ ...mockTechnician, name: 'Jane Smith' });

      const result = await service.update(companyId, 'tech-1', { name: 'Jane Smith' });

      expect(result.name).toBe('Jane Smith');
    });

    it('should update skills', async () => {
      prisma.technician.findFirst.mockResolvedValue(mockTechnician);
      prisma.technician.update.mockResolvedValue({
        ...mockTechnician,
        skills: ['hvac'],
      });

      const result = await service.update(companyId, 'tech-1', {
        skills: ['hvac'],
      });

      expect(result.skills).toEqual(['hvac']);
    });

    it('should throw NotFoundException for non-existent technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.update(companyId, 'bad', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAvailability', () => {
    it('should update availability to BUSY', async () => {
      prisma.technician.findFirst.mockResolvedValue(mockTechnician);
      prisma.technician.update.mockResolvedValue({
        ...mockTechnician,
        availability: TechnicianAvailability.BUSY,
      });

      const result = await service.updateAvailability(
        companyId,
        'tech-1',
        TechnicianAvailability.BUSY,
      );

      expect(result.availability).toBe(TechnicianAvailability.BUSY);
    });

    it('should update availability to OFF_DUTY', async () => {
      prisma.technician.findFirst.mockResolvedValue(mockTechnician);
      prisma.technician.update.mockResolvedValue({
        ...mockTechnician,
        availability: TechnicianAvailability.OFF_DUTY,
      });

      const result = await service.updateAvailability(
        companyId,
        'tech-1',
        TechnicianAvailability.OFF_DUTY,
      );

      expect(result.availability).toBe(TechnicianAvailability.OFF_DUTY);
    });

    it('should update availability back to AVAILABLE', async () => {
      const busyTech = { ...mockTechnician, availability: TechnicianAvailability.BUSY };
      prisma.technician.findFirst.mockResolvedValue(busyTech);
      prisma.technician.update.mockResolvedValue({
        ...busyTech,
        availability: TechnicianAvailability.AVAILABLE,
      });

      const result = await service.updateAvailability(
        companyId,
        'tech-1',
        TechnicianAvailability.AVAILABLE,
      );

      expect(result.availability).toBe(TechnicianAvailability.AVAILABLE);
    });

    it('should throw NotFoundException for non-existent technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.updateAvailability(companyId, 'bad', TechnicianAvailability.BUSY),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(mockTechnician);
      prisma.technician.delete.mockResolvedValue(mockTechnician);

      const result = await service.remove(companyId, 'tech-1');
      expect(result).toEqual(mockTechnician);
    });

    it('should throw NotFoundException for non-existent technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.remove(companyId, 'bad')).rejects.toThrow(NotFoundException);
    });
  });
});
