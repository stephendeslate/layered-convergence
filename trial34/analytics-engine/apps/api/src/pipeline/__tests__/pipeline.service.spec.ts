import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineService } from '../pipeline.service';
import { PrismaService } from '../../prisma.service';

// TRACED: AE-TA-UNIT-003 — Pipeline service unit tests
describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: {
    setTenantContext: jest.Mock;
    pipeline: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      setTenantContext: jest.fn(),
      pipeline: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PipelineService);
  });

  it('should reject invalid status values', async () => {
    await expect(
      service.updateStatus('1', 'INVALID', 'tenant-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid state transitions', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED' });
    await expect(
      service.updateStatus('1', 'RUNNING', 'tenant-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow valid transitions PENDING -> RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: '1', status: 'PENDING' });
    prisma.pipeline.update.mockResolvedValue({ id: '1', status: 'RUNNING' });

    const result = await service.updateStatus('1', 'RUNNING', 'tenant-1');
    expect(result.status).toBe('RUNNING');
  });

  it('should throw NotFoundException when pipeline not found', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(
      service.updateStatus('missing', 'RUNNING', 'tenant-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create pipeline with slugified name', async () => {
    prisma.pipeline.create.mockResolvedValue({
      id: '1',
      name: 'Data Pipeline',
      slug: 'data-pipeline',
      status: 'PENDING',
    });

    await service.create('Data Pipeline', {}, 'tenant-1');
    expect(prisma.pipeline.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'data-pipeline' }),
      }),
    );
  });
});
