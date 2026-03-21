import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  workOrder: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('WorkOrderService', () => {
  let service: WorkOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a work order with PENDING status', async () => {
      mockPrismaService.workOrder.create.mockResolvedValue({
        id: '1', title: 'Test', status: 'PENDING', priority: 'MEDIUM',
      });

      const result = await service.create({
        title: 'Test', description: 'Test desc', priority: 'MEDIUM',
        customerId: 'c1', companyId: 'company-1',
      });

      expect(result.status).toBe('PENDING');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when work order not found', async () => {
      mockPrismaService.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'company-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should allow PENDING -> ASSIGNED', async () => {
      mockPrismaService.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', companyId: 'company-1' });
      mockPrismaService.workOrder.update.mockResolvedValue({ id: '1', status: 'ASSIGNED' });

      const result = await service.transition('1', 'company-1', 'ASSIGNED' as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED');

      expect(result.status).toBe('ASSIGNED');
    });

    it('should allow ASSIGNED -> IN_PROGRESS', async () => {
      mockPrismaService.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED', companyId: 'company-1' });
      mockPrismaService.workOrder.update.mockResolvedValue({ id: '1', status: 'IN_PROGRESS' });

      const result = await service.transition('1', 'company-1', 'IN_PROGRESS' as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED');

      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should reject PENDING -> COMPLETED (invalid transition)', async () => {
      mockPrismaService.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', companyId: 'company-1' });

      await expect(
        service.transition('1', 'company-1', 'COMPLETED' as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED -> any (terminal state)', async () => {
      mockPrismaService.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', companyId: 'company-1' });

      await expect(
        service.transition('1', 'company-1', 'PENDING' as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject CANCELLED -> any (terminal state)', async () => {
      mockPrismaService.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', companyId: 'company-1' });

      await expect(
        service.transition('1', 'company-1', 'PENDING' as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
