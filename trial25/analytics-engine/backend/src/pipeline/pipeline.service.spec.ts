import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:TS-002] Unit test for PipelineService with mocked dependencies
describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: {
    pipeline: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };
  let tenantContext: { setTenantContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      pipeline: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantContext = { setTenantContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should list all pipelines for a tenant', async () => {
    prisma.pipeline.findMany.mockResolvedValue([{ id: 'p-1', name: 'ETL' }]);
    const result = await service.findAll('tenant-1');
    expect(result).toHaveLength(1);
    expect(tenantContext.setTenantContext).toHaveBeenCalledWith('tenant-1');
  });

  it('should throw NotFoundException when pipeline not found', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should enforce state machine transitions', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      id: 'p-1',
      status: 'DRAFT',
      tenantId: 'tenant-1',
    });

    await expect(service.transition('p-1', 'tenant-1', 'ARCHIVED')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should allow valid state transition DRAFT -> ACTIVE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      id: 'p-1',
      status: 'DRAFT',
      tenantId: 'tenant-1',
    });
    prisma.pipeline.update.mockResolvedValue({ id: 'p-1', status: 'ACTIVE' });

    const result = await service.transition('p-1', 'tenant-1', 'ACTIVE');
    expect(result.status).toBe('ACTIVE');
  });
});
