// [TRACED:TS-003] Integration test for pipeline state machine using Test.createTestingModule
import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from '@/pipeline/pipeline.service';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { TenantContextModule } from '@/tenant-context/tenant-context.module';
import { PipelineModule } from '@/pipeline/pipeline.module';
import { BadRequestException } from '@nestjs/common';
import { PipelineState } from '@prisma/client';

/**
 * Integration test: Pipeline state machine transitions.
 * Uses Test.createTestingModule to exercise the NestJS service layer (FM #61).
 */
describe('Pipeline State Machine (Integration)', () => {
  let module: TestingModule;
  let pipelineService: PipelineService;
  let prisma: PrismaService;
  let tenantId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule, TenantContextModule, PipelineModule],
    }).compile();

    pipelineService = module.get<PipelineService>(PipelineService);
    prisma = module.get<PrismaService>(PrismaService);

    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: { name: 'Integration Test Tenant', slug: `test-pipeline-${Date.now()}` },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.pipeline.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await module.close();
  });

  it('should create a pipeline in DRAFT state', async () => {
    const pipeline = await pipelineService.create({ name: 'Test Pipeline' }, tenantId);
    expect(pipeline.state).toBe(PipelineState.DRAFT);
    expect(pipeline.tenantId).toBe(tenantId);
  });

  it('should transition DRAFT -> ACTIVE -> PAUSED -> ARCHIVED -> DRAFT', async () => {
    const pipeline = await pipelineService.create({ name: 'Full Cycle' }, tenantId);

    // DRAFT -> ACTIVE
    const active = await pipelineService.transition(pipeline.id, PipelineState.ACTIVE, tenantId);
    expect(active.state).toBe(PipelineState.ACTIVE);

    // ACTIVE -> PAUSED
    const paused = await pipelineService.transition(pipeline.id, PipelineState.PAUSED, tenantId);
    expect(paused.state).toBe(PipelineState.PAUSED);

    // PAUSED -> ARCHIVED
    const archived = await pipelineService.transition(pipeline.id, PipelineState.ARCHIVED, tenantId);
    expect(archived.state).toBe(PipelineState.ARCHIVED);

    // ARCHIVED -> DRAFT
    const draft = await pipelineService.transition(pipeline.id, PipelineState.DRAFT, tenantId);
    expect(draft.state).toBe(PipelineState.DRAFT);
  });

  it('should reject invalid transition DRAFT -> PAUSED', async () => {
    const pipeline = await pipelineService.create({ name: 'Invalid Transition' }, tenantId);

    await expect(
      pipelineService.transition(pipeline.id, PipelineState.PAUSED, tenantId),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition DRAFT -> ARCHIVED', async () => {
    const pipeline = await pipelineService.create({ name: 'Skip to Archive' }, tenantId);

    await expect(
      pipelineService.transition(pipeline.id, PipelineState.ARCHIVED, tenantId),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow ACTIVE -> DRAFT (bidirectional)', async () => {
    const pipeline = await pipelineService.create({ name: 'Bidirectional' }, tenantId);
    await pipelineService.transition(pipeline.id, PipelineState.ACTIVE, tenantId);

    const draft = await pipelineService.transition(pipeline.id, PipelineState.DRAFT, tenantId);
    expect(draft.state).toBe(PipelineState.DRAFT);
  });
});
