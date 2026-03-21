// [TRACED:TS-002] Unit test for PipelineService state machine logic
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
  let tenantContext: { setContext: jest.Mock };

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
    tenantContext = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should create a pipeline in DRAFT state', async () => {
    const created = { id: '1', name: 'Test', state: PipelineState.DRAFT, tenantId: 't1' };
    prisma.pipeline.create.mockResolvedValue(created);

    const result = await service.create({ name: 'Test' }, 't1');
    expect(result.state).toBe(PipelineState.DRAFT);
  });

  it('should allow DRAFT -> ACTIVE transition', async () => {
    prisma.pipeline.findUnique.mockResolvedValue({
      id: '1',
      state: PipelineState.DRAFT,
      tenantId: 't1',
    });
    prisma.pipeline.update.mockResolvedValue({
      id: '1',
      state: PipelineState.ACTIVE,
    });

    const result = await service.transition('1', PipelineState.ACTIVE, 't1');
    expect(result.state).toBe(PipelineState.ACTIVE);
  });

  it('should reject DRAFT -> PAUSED transition', async () => {
    prisma.pipeline.findUnique.mockResolvedValue({
      id: '1',
      state: PipelineState.DRAFT,
      tenantId: 't1',
    });

    await expect(
      service.transition('1', PipelineState.PAUSED, 't1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject DRAFT -> ARCHIVED transition', async () => {
    prisma.pipeline.findUnique.mockResolvedValue({
      id: '1',
      state: PipelineState.DRAFT,
      tenantId: 't1',
    });

    await expect(
      service.transition('1', PipelineState.ARCHIVED, 't1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException for non-existent pipeline', async () => {
    prisma.pipeline.findUnique.mockResolvedValue(null);

    await expect(service.findById('bad', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should return valid transitions map', () => {
    const transitions = service.getValidTransitions();
    expect(transitions[PipelineState.DRAFT]).toContain(PipelineState.ACTIVE);
    expect(transitions[PipelineState.ACTIVE]).toContain(PipelineState.PAUSED);
    expect(transitions[PipelineState.PAUSED]).toContain(PipelineState.ARCHIVED);
    expect(transitions[PipelineState.ARCHIVED]).toContain(PipelineState.DRAFT);
  });
});
