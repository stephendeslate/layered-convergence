import { Test, TestingModule } from '@nestjs/testing';
import { SyncRunService } from './sync-run.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  syncRun: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SyncRunService', () => {
  let service: SyncRunService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncRunService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SyncRunService>(SyncRunService);
    jest.clearAllMocks();
  });

  describe('transition', () => {
    it('should allow PENDING -> RUNNING', async () => {
      mockPrismaService.syncRun.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', tenantId: 't1' });
      mockPrismaService.syncRun.update.mockResolvedValue({ id: '1', status: 'RUNNING' });

      const result = await service.transition('1', 't1', 'RUNNING' as 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED');

      expect(result.status).toBe('RUNNING');
    });

    it('should reject PENDING -> COMPLETED', async () => {
      mockPrismaService.syncRun.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', tenantId: 't1' });

      await expect(
        service.transition('1', 't1', 'COMPLETED' as 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED -> any (terminal state)', async () => {
      mockPrismaService.syncRun.findFirst.mockResolvedValue({ id: '1', status: 'FAILED', tenantId: 't1' });

      await expect(
        service.transition('1', 't1', 'RUNNING' as 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when sync run not found', async () => {
      mockPrismaService.syncRun.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
    });
  });
});
