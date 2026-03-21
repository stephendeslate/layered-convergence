import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GpsHistoryService } from './gps-history.service';
import { PrismaService } from '../prisma/prisma.service';
import { BullMqService } from '../bullmq/bullmq.service';

describe('GpsHistoryService', () => {
  let service: GpsHistoryService;
  let prisma: any;
  let bullmq: any;

  const COMPANY_ID = 'company-1';
  const TECH_ID = 'tech-1';

  function makePosition(overrides: Record<string, any> = {}) {
    return {
      companyId: COMPANY_ID,
      technicianId: TECH_ID,
      latitude: 39.78,
      longitude: -89.65,
      accuracy: 10,
      heading: null,
      speed: null,
      recordedAt: new Date(),
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      technicianPosition: {
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
        findMany: vi.fn().mockResolvedValue([]),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };

    const mockQueue = {
      add: vi.fn().mockResolvedValue({}),
    };

    bullmq = {
      getQueue: vi.fn().mockReturnValue(mockQueue),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsHistoryService,
        { provide: PrismaService, useValue: prisma },
        { provide: BullMqService, useValue: bullmq },
      ],
    }).compile();

    service = module.get<GpsHistoryService>(GpsHistoryService);
    // Don't call onModuleInit to avoid timers in tests
  });

  afterEach(() => {
    // Clean up any timers
    vi.restoreAllMocks();
  });

  describe('addPosition', () => {
    it('should add position to buffer', () => {
      service.addPosition(makePosition());
      expect(service.getBufferSize()).toBe(1);
    });
  });

  describe('flush', () => {
    it('should batch insert buffered positions', async () => {
      prisma.technicianPosition.createMany.mockResolvedValue({ count: 3 });

      service.addPosition(makePosition());
      service.addPosition(makePosition({ latitude: 39.79 }));
      service.addPosition(makePosition({ latitude: 39.80 }));

      const count = await service.flush();

      expect(count).toBe(3);
      expect(prisma.technicianPosition.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ technicianId: TECH_ID }),
        ]),
      });
      expect(service.getBufferSize()).toBe(0);
    });

    it('should return 0 when buffer is empty', async () => {
      const count = await service.flush();
      expect(count).toBe(0);
      expect(prisma.technicianPosition.createMany).not.toHaveBeenCalled();
    });

    it('should restore buffer on failure', async () => {
      prisma.technicianPosition.createMany.mockRejectedValue(new Error('DB error'));

      service.addPosition(makePosition());
      service.addPosition(makePosition());

      const count = await service.flush();

      expect(count).toBe(0);
      expect(service.getBufferSize()).toBe(2); // Records restored
    });
  });

  describe('getRecentPositions', () => {
    it('should query recent positions', async () => {
      const positions = [
        { latitude: 39.78, longitude: -89.65, accuracy: 10, heading: null, speed: null, recordedAt: new Date() },
      ];
      prisma.technicianPosition.findMany.mockResolvedValue(positions);

      const result = await service.getRecentPositions(COMPANY_ID, TECH_ID, 8, 500);

      expect(result).toEqual(positions);
      expect(prisma.technicianPosition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: COMPANY_ID,
            technicianId: TECH_ID,
          }),
          orderBy: { recordedAt: 'asc' },
          take: 500,
        }),
      );
    });
  });

  describe('getPositionsBetween', () => {
    it('should query positions in a time range', async () => {
      prisma.technicianPosition.findMany.mockResolvedValue([]);

      const from = new Date('2026-03-20T08:00:00Z');
      const to = new Date('2026-03-20T17:00:00Z');

      await service.getPositionsBetween(COMPANY_ID, TECH_ID, from, to);

      expect(prisma.technicianPosition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            recordedAt: { gte: from, lte: to },
          }),
        }),
      );
    });
  });

  describe('purgeOldPositions', () => {
    it('should delete positions older than retention period', async () => {
      prisma.technicianPosition.deleteMany.mockResolvedValue({ count: 100 });

      const count = await service.purgeOldPositions(90);

      expect(count).toBe(100);
      expect(prisma.technicianPosition.deleteMany).toHaveBeenCalledWith({
        where: {
          recordedAt: { lt: expect.any(Date) },
        },
      });
    });
  });
});
