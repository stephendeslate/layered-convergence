import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PipelineService } from '../src/pipeline/pipeline.service';
import { PipelineModule } from '../src/pipeline/pipeline.module';
import { BadRequestException } from '@nestjs/common';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://testuser:testpass@localhost:5433/analytics_test';

describe('Pipeline State Machine (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let pipelineService: PipelineService;
  let tenantId: string;
  let dataSourceId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = DATABASE_URL;

    module = await Test.createTestingModule({
      imports: [PrismaModule, PipelineModule],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    pipelineService = module.get<PipelineService>(PipelineService);

    await prisma.$connect();

    // Cleanup using $executeRaw with tagged template literals
    await prisma.$executeRaw`DELETE FROM pipelines`;
    await prisma.$executeRaw`DELETE FROM data_sources`;
    await prisma.$executeRaw`DELETE FROM tenants`;

    const tenant = await prisma.tenant.create({
      data: { name: 'Integration Test Tenant', slug: 'int-test-pipeline-t19' },
    });
    tenantId = tenant.id;

    const ds = await prisma.dataSource.create({
      data: {
        tenantId,
        name: 'Test Source',
        type: 'POSTGRESQL',
        connectionString: 'postgres://localhost:5432/test',
      },
    });
    dataSourceId = ds.id;
  });

  afterAll(async () => {
    await prisma.$executeRaw`DELETE FROM pipelines`;
    await prisma.$executeRaw`DELETE FROM data_sources`;
    await prisma.$executeRaw`DELETE FROM tenants`;
    await prisma.$disconnect();
    await module.close();
  });

  it('should create pipeline in DRAFT and transition through valid states via service layer', async () => {
    const pipeline = await pipelineService.create(tenantId, {
      name: 'State Machine Test',
      dataSourceId,
      config: { transform: 'none' },
    });

    expect(pipeline.status).toBe('DRAFT');

    // DRAFT -> ACTIVE
    const activated = await pipelineService.transition(tenantId, pipeline.id, { status: 'ACTIVE' as never });
    expect(activated.status).toBe('ACTIVE');

    // ACTIVE -> PAUSED
    const paused = await pipelineService.transition(tenantId, pipeline.id, { status: 'PAUSED' as never });
    expect(paused.status).toBe('PAUSED');

    // PAUSED -> ACTIVE
    const resumed = await pipelineService.transition(tenantId, pipeline.id, { status: 'ACTIVE' as never });
    expect(resumed.status).toBe('ACTIVE');

    // ACTIVE -> ARCHIVED
    const archived = await pipelineService.transition(tenantId, pipeline.id, { status: 'ARCHIVED' as never });
    expect(archived.status).toBe('ARCHIVED');

    // ARCHIVED -> DRAFT
    const reset = await pipelineService.transition(tenantId, pipeline.id, { status: 'DRAFT' as never });
    expect(reset.status).toBe('DRAFT');
  });

  it('should reject invalid transition DRAFT to PAUSED via service layer', async () => {
    const pipeline = await pipelineService.create(tenantId, {
      name: 'Invalid Transition Test',
      dataSourceId,
    });

    expect(pipeline.status).toBe('DRAFT');

    await expect(
      pipelineService.transition(tenantId, pipeline.id, { status: 'PAUSED' as never }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition DRAFT to ARCHIVED via service layer', async () => {
    const pipeline = await pipelineService.create(tenantId, {
      name: 'Invalid Archive Test',
      dataSourceId,
    });

    await expect(
      pipelineService.transition(tenantId, pipeline.id, { status: 'ARCHIVED' as never }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition ARCHIVED to ACTIVE via service layer', async () => {
    const pipeline = await pipelineService.create(tenantId, {
      name: 'Archived to Active Test',
      dataSourceId,
    });

    // DRAFT -> ACTIVE -> ARCHIVED
    await pipelineService.transition(tenantId, pipeline.id, { status: 'ACTIVE' as never });
    await pipelineService.transition(tenantId, pipeline.id, { status: 'ARCHIVED' as never });

    await expect(
      pipelineService.transition(tenantId, pipeline.id, { status: 'ACTIVE' as never }),
    ).rejects.toThrow(BadRequestException);
  });
});
