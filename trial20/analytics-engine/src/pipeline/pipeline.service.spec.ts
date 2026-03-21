import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PipelineState } from '@prisma/client';

describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: {
    pipeline: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };
  let tenantCtx: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      pipeline: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantCtx = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantCtx },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should transition DRAFT to ACTIVE', async () => {
    prisma.pipeline.findUnique.mockResolvedValue({
      id: '1',
      state: PipelineState.DRAFT,
      tenantId: 'tenant-1',
    });
    prisma.pipeline.update.mockResolvedValue({
      id: '1',
      state: PipelineState.ACTIVE,
    });

    const result = await service.transition('1', PipelineState.ACTIVE, 'tenant-1');
    expect(result.state).toBe(PipelineState.ACTIVE);
  });

  it('should reject invalid transition DRAFT to ARCHIVED', async () => {
    prisma.pipeline.findUnique.mockResolvedValue({
      id: '1',
      state: PipelineState.DRAFT,
      tenantId: 'tenant-1',
    });

    await expect(
      service.transition('1', PipelineState.ARCHIVED, 'tenant-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should transition ACTIVE to PAUSED', async () => {
    prisma.pipeline.findUnique.mockResolvedValue({
      id: '1',
      state: PipelineState.ACTIVE,
      tenantId: 'tenant-1',
    });
    prisma.pipeline.update.mockResolvedValue({ id: '1', state: PipelineState.PAUSED });

    const result = await service.transition('1', PipelineState.PAUSED, 'tenant-1');
    expect(result.state).toBe(PipelineState.PAUSED);
  });

  it('should transition PAUSED to ARCHIVED', async () => {
    prisma.pipeline.findUnique.mockResolvedValue({
      id: '1',
      state: PipelineState.PAUSED,
      tenantId: 'tenant-1',
    });
    prisma.pipeline.update.mockResolvedValue({ id: '1', state: PipelineState.ARCHIVED });

    const result = await service.transition('1', PipelineState.ARCHIVED, 'tenant-1');
    expect(result.state).toBe(PipelineState.ARCHIVED);
  });

  it('should transition ARCHIVED back to DRAFT', async () => {
    prisma.pipeline.findUnique.mockResolvedValue({
      id: '1',
      state: PipelineState.ARCHIVED,
      tenantId: 'tenant-1',
    });
    prisma.pipeline.update.mockResolvedValue({ id: '1', state: PipelineState.DRAFT });

    const result = await service.transition('1', PipelineState.DRAFT, 'tenant-1');
    expect(result.state).toBe(PipelineState.DRAFT);
  });

  it('should throw NotFoundException for missing pipeline', async () => {
    prisma.pipeline.findUnique.mockResolvedValue(null);
    await expect(service.findById('bad', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should return valid transitions map', () => {
    const transitions = service.getValidTransitions();
    expect(transitions[PipelineState.DRAFT]).toContain(PipelineState.ACTIVE);
    expect(transitions[PipelineState.ARCHIVED]).toContain(PipelineState.DRAFT);
  });
});
