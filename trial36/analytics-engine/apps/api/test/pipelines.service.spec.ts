import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelinesService } from '../src/pipelines/pipelines.service';
import { PrismaService } from '../src/prisma.service';

const mockPrisma = {
  pipeline: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PipelinesService', () => {
  let service: PipelinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelinesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PipelinesService>(PipelinesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated pipelines', async () => {
      const pipelines = [{ id: 'p-1', name: 'Pipeline 1', tenantId: 'tenant-1' }];
      mockPrisma.pipeline.findMany.mockResolvedValue(pipelines);
      mockPrisma.pipeline.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.data).toEqual(pipelines);
      expect(result.total).toBe(1);
    });

    it('should cap pageSize at MAX_PAGE_SIZE', async () => {
      mockPrisma.pipeline.findMany.mockResolvedValue([]);
      mockPrisma.pipeline.count.mockResolvedValue(0);

      await service.findAll('tenant-1', 1, 200);

      expect(mockPrisma.pipeline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return pipeline when found', async () => {
      const pipeline = { id: 'p-1', name: 'Test', tenantId: 'tenant-1', status: 'ACTIVE' };
      mockPrisma.pipeline.findFirst.mockResolvedValue(pipeline);

      const result = await service.findOne('p-1', 'tenant-1');
      expect(result).toEqual(pipeline);
    });

    it('should throw NotFoundException when pipeline not found', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create pipeline with sanitized name', async () => {
      mockPrisma.pipeline.create.mockResolvedValue({
        id: 'p-1',
        name: 'ETL Pipeline',
        status: 'ACTIVE',
      });

      await service.create('tenant-1', 'user-1', {
        name: '<em>ETL Pipeline</em>',
      });

      expect(mockPrisma.pipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'ETL Pipeline',
        }),
      });
    });
  });

  describe('updateStatus', () => {
    it('should update status for valid transition', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'p-1',
        status: 'ACTIVE',
        tenantId: 'tenant-1',
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'p-1',
        status: 'PAUSED',
      });

      const result = await service.updateStatus('p-1', 'tenant-1', 'PAUSED');
      expect(result.status).toBe('PAUSED');
    });

    it('should throw BadRequestException for invalid transition', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'p-1',
        status: 'COMPLETED',
        tenantId: 'tenant-1',
      });

      await expect(
        service.updateStatus('p-1', 'tenant-1', 'PAUSED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow FAILED to ACTIVE transition', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'p-1',
        status: 'FAILED',
        tenantId: 'tenant-1',
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'p-1',
        status: 'ACTIVE',
      });

      const result = await service.updateStatus('p-1', 'tenant-1', 'ACTIVE');
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('remove', () => {
    it('should delete an existing pipeline', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'p-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.pipeline.delete.mockResolvedValue({ id: 'p-1' });

      await service.remove('p-1', 'tenant-1');
      expect(mockPrisma.pipeline.delete).toHaveBeenCalledWith({
        where: { id: 'p-1' },
      });
    });
  });
});
