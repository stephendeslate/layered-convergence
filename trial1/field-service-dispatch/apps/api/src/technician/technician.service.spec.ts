import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('TechnicianService', () => {
  let service: TechnicianService;
  let prisma: any;
  let audit: any;

  const COMPANY_ID = 'company-1';
  const USER_ID = 'user-1';

  function makeTechnician(overrides: Record<string, any> = {}) {
    return {
      id: 'tech-1',
      companyId: COMPANY_ID,
      userId: 'user-tech-1',
      status: 'AVAILABLE',
      skills: ['HVAC_REPAIR', 'HVAC_INSTALL'],
      maxJobsPerDay: 8,
      currentLatitude: 39.78,
      currentLongitude: -89.65,
      lastPositionAt: new Date(),
      vehicleInfo: 'Ford F-150',
      color: '#3B82F6',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '555-0100', avatarUrl: null },
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: vi.fn(),
      },
      technician: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(1),
      },
      workOrder: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechnicianService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<TechnicianService>(TechnicianService);
  });

  describe('create', () => {
    it('should create a technician profile', async () => {
      const tech = makeTechnician();
      prisma.user.findFirst.mockResolvedValue({ id: 'user-tech-1', companyId: COMPANY_ID });
      prisma.technician.findUnique.mockResolvedValue(null);
      prisma.technician.create.mockResolvedValue(tech);

      const result = await service.create(COMPANY_ID, {
        userId: 'user-tech-1',
        skills: ['HVAC_REPAIR', 'HVAC_INSTALL'],
      }, USER_ID);

      expect(result.id).toBe('tech-1');
      expect(prisma.technician.create).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'technician.create',
      }));
    });

    it('should reject if user not found in company', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.create(COMPANY_ID, { userId: 'missing-user', skills: ['HVAC_REPAIR'] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if technician profile already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'user-tech-1', companyId: COMPANY_ID });
      prisma.technician.findUnique.mockResolvedValue(makeTechnician());

      await expect(
        service.create(COMPANY_ID, { userId: 'user-tech-1', skills: ['HVAC_REPAIR'] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('should return a technician by id', async () => {
      const tech = makeTechnician();
      prisma.technician.findFirst.mockResolvedValue(tech);

      const result = await service.get(COMPANY_ID, 'tech-1');
      expect(result.id).toBe('tech-1');
    });

    it('should throw NotFoundException for missing technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.get(COMPANY_ID, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update technician fields', async () => {
      const tech = makeTechnician();
      prisma.technician.findFirst.mockResolvedValue(tech);
      prisma.technician.update.mockResolvedValue({ ...tech, skills: ['PLUMBING'] });

      const result = await service.update(COMPANY_ID, 'tech-1', { skills: ['PLUMBING'] }, USER_ID);

      expect(prisma.technician.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ skills: ['PLUMBING'] }),
        }),
      );
      expect(audit.log).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());
      prisma.technician.delete.mockResolvedValue({});

      await service.delete(COMPANY_ID, 'tech-1', USER_ID);

      expect(prisma.technician.delete).toHaveBeenCalledWith({ where: { id: 'tech-1' } });
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'technician.delete',
      }));
    });

    it('should throw if technician not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.delete(COMPANY_ID, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('should return paginated list', async () => {
      const tech = makeTechnician();
      prisma.technician.findMany.mockResolvedValue([tech]);
      prisma.technician.count.mockResolvedValue(1);

      const result = await service.list(COMPANY_ID, { page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.technician.findMany.mockResolvedValue([]);
      prisma.technician.count.mockResolvedValue(0);

      await service.list(COMPANY_ID, { status: 'AVAILABLE' });

      expect(prisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'AVAILABLE' }),
        }),
      );
    });
  });

  describe('getSchedule', () => {
    it('should return work orders for a technician on a date', async () => {
      const tech = makeTechnician();
      prisma.technician.findFirst.mockResolvedValue(tech);
      prisma.workOrder.findMany.mockResolvedValue([
        { id: 'wo-1', technicianId: 'tech-1', status: 'ASSIGNED' },
      ]);

      const result = await service.getSchedule(COMPANY_ID, 'tech-1', '2026-03-20');

      expect(result.technicianId).toBe('tech-1');
      expect(result.workOrders).toHaveLength(1);
    });
  });

  describe('updatePosition', () => {
    it('should update technician GPS position', async () => {
      prisma.technician.update.mockResolvedValue({});

      await service.updatePosition('tech-1', 39.79, -89.66);

      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: expect.objectContaining({
          currentLatitude: 39.79,
          currentLongitude: -89.66,
        }),
      });
    });
  });

  describe('getNearby', () => {
    it('should return nearby technicians sorted by distance', async () => {
      const techClose = makeTechnician({ id: 'tech-close', currentLatitude: 39.782, currentLongitude: -89.650 });
      const techFar = makeTechnician({ id: 'tech-far', currentLatitude: 40.00, currentLongitude: -89.65 });
      prisma.technician.findMany.mockResolvedValue([techClose, techFar]);

      const result = await service.getNearby(COMPANY_ID, 39.7817, -89.6501, 50);

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].id).toBe('tech-close');
      // Closer technician should have smaller distance
      if (result.length > 1) {
        expect(result[0].distanceMeters).toBeLessThan(result[1].distanceMeters);
      }
    });

    it('should filter out technicians beyond radius', async () => {
      const techFar = makeTechnician({ id: 'tech-far', currentLatitude: 45.00, currentLongitude: -89.65 });
      prisma.technician.findMany.mockResolvedValue([techFar]);

      const result = await service.getNearby(COMPANY_ID, 39.7817, -89.6501, 10); // 10km radius

      expect(result).toHaveLength(0);
    });

    it('should filter by skills when provided', async () => {
      prisma.technician.findMany.mockResolvedValue([]);

      await service.getNearby(COMPANY_ID, 39.78, -89.65, 50, ['PLUMBING']);

      expect(prisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            skills: { hasSome: ['PLUMBING'] },
          }),
        }),
      );
    });
  });
});
