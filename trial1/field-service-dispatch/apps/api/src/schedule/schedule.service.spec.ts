import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let prisma: any;
  let audit: any;

  const COMPANY_ID = 'company-1';
  const TECH_ID = 'tech-1';

  function makeTechnician(overrides: Record<string, any> = {}) {
    return {
      id: TECH_ID,
      companyId: COMPANY_ID,
      schedule: { availability: [] },
      user: { firstName: 'John', lastName: 'Doe' },
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      technician: {
        findFirst: vi.fn(),
        update: vi.fn(),
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
        ScheduleService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  describe('setAvailability', () => {
    it('should set availability windows', async () => {
      const tech = makeTechnician();
      prisma.technician.findFirst.mockResolvedValue(tech);
      prisma.technician.update.mockResolvedValue(tech);

      const availability = [
        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' },
      ];

      const result = await service.setAvailability(COMPANY_ID, {
        technicianId: TECH_ID,
        availability,
      });

      expect(result.technicianId).toBe(TECH_ID);
      expect(result.availability).toHaveLength(2);
      expect(audit.log).toHaveBeenCalled();
    });

    it('should reject invalid day of week', async () => {
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());

      await expect(
        service.setAvailability(COMPANY_ID, {
          technicianId: TECH_ID,
          availability: [{ dayOfWeek: 7, startTime: '08:00', endTime: '17:00' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid time format', async () => {
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());

      await expect(
        service.setAvailability(COMPANY_ID, {
          technicianId: TECH_ID,
          availability: [{ dayOfWeek: 1, startTime: '8am', endTime: '5pm' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject start time after end time', async () => {
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());

      await expect(
        service.setAvailability(COMPANY_ID, {
          technicianId: TECH_ID,
          availability: [{ dayOfWeek: 1, startTime: '17:00', endTime: '08:00' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.setAvailability(COMPANY_ID, {
          technicianId: 'missing',
          availability: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailability', () => {
    it('should return availability windows', async () => {
      const windows = [{ dayOfWeek: 1, startTime: '08:00', endTime: '17:00' }];
      prisma.technician.findFirst.mockResolvedValue(
        makeTechnician({ schedule: { availability: windows } }),
      );

      const result = await service.getAvailability(COMPANY_ID, TECH_ID);

      expect(result.availability).toEqual(windows);
    });

    it('should return empty array if no schedule set', async () => {
      prisma.technician.findFirst.mockResolvedValue(
        makeTechnician({ schedule: {} }),
      );

      const result = await service.getAvailability(COMPANY_ID, TECH_ID);

      expect(result.availability).toEqual([]);
    });
  });

  describe('getDailySchedule', () => {
    it('should return work orders for a date', async () => {
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());
      prisma.workOrder.findMany.mockResolvedValue([
        { id: 'wo-1', scheduledStart: new Date('2026-03-20T09:00:00Z') },
      ]);

      const result = await service.getDailySchedule(COMPANY_ID, TECH_ID, '2026-03-20');

      expect(result.date).toBe('2026-03-20');
      expect(result.workOrders).toHaveLength(1);
    });
  });

  describe('getWeeklySchedule', () => {
    it('should return work orders grouped by date', async () => {
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());
      prisma.workOrder.findMany.mockResolvedValue([
        { id: 'wo-1', scheduledStart: new Date('2026-03-20T09:00:00Z') },
        { id: 'wo-2', scheduledStart: new Date('2026-03-21T10:00:00Z') },
      ]);

      const result = await service.getWeeklySchedule(COMPANY_ID, TECH_ID, '2026-03-20');

      expect(result.weekStart).toBe('2026-03-20');
      expect(Object.keys(result.days).length).toBeGreaterThan(0);
    });
  });

  describe('detectConflicts', () => {
    it('should detect overlapping work orders', async () => {
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());
      prisma.workOrder.findMany.mockResolvedValue([
        {
          id: 'wo-1',
          scheduledStart: new Date('2026-03-20T09:00:00Z'),
          scheduledEnd: new Date('2026-03-20T11:00:00Z'),
        },
        {
          id: 'wo-2',
          scheduledStart: new Date('2026-03-20T10:00:00Z'),
          scheduledEnd: new Date('2026-03-20T12:00:00Z'),
        },
      ]);

      const conflicts = await service.detectConflicts(COMPANY_ID, TECH_ID, '2026-03-20');

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflictType).toBe('overlap');
      expect(conflicts[0].workOrderId).toBe('wo-2');
    });

    it('should return empty when no conflicts', async () => {
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());
      prisma.workOrder.findMany.mockResolvedValue([
        {
          id: 'wo-1',
          scheduledStart: new Date('2026-03-20T09:00:00Z'),
          scheduledEnd: new Date('2026-03-20T10:00:00Z'),
        },
        {
          id: 'wo-2',
          scheduledStart: new Date('2026-03-20T11:00:00Z'),
          scheduledEnd: new Date('2026-03-20T12:00:00Z'),
        },
      ]);

      const conflicts = await service.detectConflicts(COMPANY_ID, TECH_ID, '2026-03-20');

      expect(conflicts).toHaveLength(0);
    });
  });
});
