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

  describe('create', () => {
    it('should create a sync run with PENDING status', async () => {
      const data = { dataSourceId: 'ds-1', tenantId: 'tenant-1' };
      const created = { id: 'sr-1', status: 'PENDING', ...data };

      mockPrismaService.syncRun.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result.status).toBe('PENDING');
    });
  });

  describe('findAll', () => {
    it('should return all sync runs for tenant', async () => {
      mockPrismaService.syncRun.findMany.mockResolvedValue([]);
      const result = await service.findAll('tenant-1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.syncRun.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should allow PENDING -> RUNNING transition', async () => {
      const syncRun = { id: 'sr-1', status: 'PENDING', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(syncRun);
      mockPrismaService.syncRun.update.mockResolvedValue({ ...syncRun, status: 'RUNNING' });

      const result = await service.transition('sr-1', 'tenant-1', 'RUNNING' as never);
      expect(result.status).toBe('RUNNING');
    });

    it('should allow RUNNING -> FAILED with error message', async () => {
      const syncRun = { id: 'sr-1', status: 'RUNNING', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(syncRun);
      mockPrismaService.syncRun.update.mockResolvedValue({ ...syncRun, status: 'FAILED', errorMessage: 'Timeout' });

      const result = await service.transition('sr-1', 'tenant-1', 'FAILED' as never, 'Timeout');
      expect(result.status).toBe('FAILED');
    });

    it('should reject invalid transition PENDING -> SUCCESS', async () => {
      const syncRun = { id: 'sr-1', status: 'PENDING', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(syncRun);

      await expect(service.transition('sr-1', 'tenant-1', 'SUCCESS' as never)).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from terminal state SUCCESS', async () => {
      const syncRun = { id: 'sr-1', status: 'SUCCESS', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(syncRun);

      await expect(service.transition('sr-1', 'tenant-1', 'RUNNING' as never)).rejects.toThrow(BadRequestException);
    });
  });
});
