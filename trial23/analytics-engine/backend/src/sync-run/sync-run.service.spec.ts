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
    it('should create a sync run', async () => {
      const data = { dataSourceId: 'ds-1', tenantId: 'tenant-1' };
      const created = { id: 'sr-1', status: 'PENDING', ...data };

      mockPrismaService.syncRun.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return sync runs for tenant', async () => {
      const runs = [{ id: 'sr-1', tenantId: 'tenant-1', status: 'PENDING' }];
      mockPrismaService.syncRun.findMany.mockResolvedValue(runs);

      const result = await service.findAll('tenant-1');
      expect(result).toEqual(runs);
    });
  });

  describe('findOne', () => {
    it('should return sync run when found', async () => {
      const run = { id: 'sr-1', tenantId: 'tenant-1', status: 'PENDING' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(run);

      const result = await service.findOne('sr-1', 'tenant-1');
      expect(result).toEqual(run);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.syncRun.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition (state machine)', () => {
    it('should allow PENDING -> RUNNING', async () => {
      const run = { id: 'sr-1', status: 'PENDING', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(run);
      mockPrismaService.syncRun.update.mockResolvedValue({ ...run, status: 'RUNNING' });

      const result = await service.transition('sr-1', 'tenant-1', 'RUNNING' as const);
      expect(result.status).toBe('RUNNING');
    });

    it('should allow RUNNING -> SUCCESS', async () => {
      const run = { id: 'sr-1', status: 'RUNNING', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(run);
      mockPrismaService.syncRun.update.mockResolvedValue({ ...run, status: 'SUCCESS' });

      const result = await service.transition('sr-1', 'tenant-1', 'SUCCESS' as const);
      expect(result.status).toBe('SUCCESS');
    });

    it('should allow RUNNING -> FAILED with error message', async () => {
      const run = { id: 'sr-1', status: 'RUNNING', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(run);
      mockPrismaService.syncRun.update.mockResolvedValue({ ...run, status: 'FAILED', errorMessage: 'Timeout' });

      const result = await service.transition('sr-1', 'tenant-1', 'FAILED' as const, 'Timeout');
      expect(result.status).toBe('FAILED');
    });

    it('should reject PENDING -> SUCCESS', async () => {
      const run = { id: 'sr-1', status: 'PENDING', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(run);

      await expect(service.transition('sr-1', 'tenant-1', 'SUCCESS' as const)).rejects.toThrow(BadRequestException);
    });

    it('should reject PENDING -> FAILED', async () => {
      const run = { id: 'sr-1', status: 'PENDING', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(run);

      await expect(service.transition('sr-1', 'tenant-1', 'FAILED' as const)).rejects.toThrow(BadRequestException);
    });

    it('should reject SUCCESS -> any', async () => {
      const run = { id: 'sr-1', status: 'SUCCESS', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(run);

      await expect(service.transition('sr-1', 'tenant-1', 'RUNNING' as const)).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED -> any', async () => {
      const run = { id: 'sr-1', status: 'FAILED', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(run);

      await expect(service.transition('sr-1', 'tenant-1', 'RUNNING' as const)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete sync run', async () => {
      const run = { id: 'sr-1', tenantId: 'tenant-1' };
      mockPrismaService.syncRun.findFirst.mockResolvedValue(run);
      mockPrismaService.syncRun.delete.mockResolvedValue(run);

      await service.remove('sr-1', 'tenant-1');
      expect(mockPrismaService.syncRun.delete).toHaveBeenCalledWith({ where: { id: 'sr-1' } });
    });
  });
});
