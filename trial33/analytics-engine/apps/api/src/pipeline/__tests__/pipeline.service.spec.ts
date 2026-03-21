import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineService } from '../pipeline.service';
import { PrismaService } from '../../prisma.service';

// TRACED: AE-TST-PIPE-001 — Pipeline service unit tests
describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: {
    pipeline: { findMany: jest.Mock };
    pipelineRun: { findFirst: jest.Mock; update: jest.Mock };
    setTenantContext: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      pipeline: { findMany: jest.fn().mockResolvedValue([]) },
      pipelineRun: { findFirst: jest.fn(), update: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException for unknown run', async () => {
    prisma.pipelineRun.findFirst.mockResolvedValue(null);

    await expect(
      service.transition('nonexistent', 'RUNNING', 'tenant-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should reject invalid state transition', async () => {
    prisma.pipelineRun.findFirst.mockResolvedValue({
      id: '1',
      status: 'COMPLETED',
      pipeline: { tenantId: 'tenant-1' },
    });

    await expect(
      service.transition('1', 'RUNNING', 'tenant-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow PENDING -> RUNNING transition', async () => {
    prisma.pipelineRun.findFirst.mockResolvedValue({
      id: '1',
      status: 'PENDING',
      pipeline: { tenantId: 'tenant-1' },
    });
    prisma.pipelineRun.update.mockResolvedValue({ id: '1', status: 'RUNNING' });

    const result = await service.transition('1', 'RUNNING', 'tenant-1');
    expect(result.status).toBe('RUNNING');
  });
});
