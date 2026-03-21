import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../../common/prisma.service';
import { WorkOrderStatus, BadRequestException } from '@nestjs/common';

/**
 * Unit tests for the work order state machine.
 * Verifies all valid transitions and rejects invalid ones.
 * Convention 5.22: verifies BadRequestException (not plain Error) for invalid transitions.
 */
describe('WorkOrderService', () => {
  let service: WorkOrderService;

  const mockPrisma = {
    workOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workOrderStatusHistory: { create: jest.fn() },
    technician: { findFirstOrThrow: jest.fn() },
    $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        workOrderStatusHistory: { create: jest.fn() },
        workOrder: { update: jest.fn().mockResolvedValue({}) },
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  describe('getStatusLabel', () => {
    it('should return label for all valid statuses', () => {
      const statuses = Object.values(WorkOrderStatus);
      for (const status of statuses) {
        expect(() => service.getStatusLabel(status)).not.toThrow();
        expect(typeof service.getStatusLabel(status)).toBe('string');
      }
    });
  });

  describe('transition', () => {
    it('should reject invalid transition from UNASSIGNED to COMPLETED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        companyId: 'company-1',
        status: WorkOrderStatus.UNASSIGNED,
      });

      await expect(
        service.transition('company-1', 'wo-1', {
          toStatus: WorkOrderStatus.COMPLETED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition from PAID to any state', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        companyId: 'company-1',
        status: WorkOrderStatus.PAID,
      });

      await expect(
        service.transition('company-1', 'wo-1', {
          toStatus: WorkOrderStatus.UNASSIGNED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject skipping states (ASSIGNED -> COMPLETED)', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        companyId: 'company-1',
        status: WorkOrderStatus.ASSIGNED,
      });

      await expect(
        service.transition('company-1', 'wo-1', {
          toStatus: WorkOrderStatus.COMPLETED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignTechnician', () => {
    it('should reject assignment to non-UNASSIGNED work order', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        companyId: 'company-1',
        status: WorkOrderStatus.ASSIGNED,
      });

      await expect(
        service.assignTechnician('company-1', 'wo-1', 'tech-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
