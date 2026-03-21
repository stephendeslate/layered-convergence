import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, PipelineStatus } from '@prisma/client';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://testuser:testpass@localhost:5433/analytics_test';

describe('Pipeline State Machine (Integration)', () => {
  let prisma: PrismaClient;
  let tenantId: string;
  let dataSourceId: string;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
    await prisma.$connect();

    await prisma.$executeRawUnsafe('DELETE FROM "Pipeline"');
    await prisma.$executeRawUnsafe('DELETE FROM "DataSource"');
    await prisma.$executeRawUnsafe('DELETE FROM "Tenant"');

    const tenant = await prisma.tenant.create({
      data: { name: 'Integration Test Tenant', slug: 'int-test-pipeline' },
    });
    tenantId = tenant.id;

    const ds = await prisma.dataSource.create({
      data: {
        tenantId,
        name: 'Test Source',
        type: 'POSTGRESQL',
        config: { host: 'localhost' },
      },
    });
    dataSourceId = ds.id;
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe('DELETE FROM "Pipeline"');
    await prisma.$executeRawUnsafe('DELETE FROM "DataSource"');
    await prisma.$executeRawUnsafe('DELETE FROM "Tenant"');
    await prisma.$disconnect();
  });

  it('should start in DRAFT and transition through valid states', async () => {
    const pipeline = await prisma.pipeline.create({
      data: {
        tenantId,
        name: 'State Machine Test',
        config: { transform: 'none' },
        dataSourceId,
        status: PipelineStatus.DRAFT,
      },
    });

    expect(pipeline.status).toBe(PipelineStatus.DRAFT);

    const activated = await prisma.pipeline.update({
      where: { id: pipeline.id },
      data: { status: PipelineStatus.ACTIVE },
    });
    expect(activated.status).toBe(PipelineStatus.ACTIVE);

    const paused = await prisma.pipeline.update({
      where: { id: pipeline.id },
      data: { status: PipelineStatus.PAUSED },
    });
    expect(paused.status).toBe(PipelineStatus.PAUSED);

    const resumed = await prisma.pipeline.update({
      where: { id: pipeline.id },
      data: { status: PipelineStatus.ACTIVE },
    });
    expect(resumed.status).toBe(PipelineStatus.ACTIVE);

    const completed = await prisma.pipeline.update({
      where: { id: pipeline.id },
      data: { status: PipelineStatus.COMPLETED },
    });
    expect(completed.status).toBe(PipelineStatus.COMPLETED);

    const resetToDraft = await prisma.pipeline.update({
      where: { id: pipeline.id },
      data: { status: PipelineStatus.DRAFT },
    });
    expect(resetToDraft.status).toBe(PipelineStatus.DRAFT);
  });

  it('should persist FAILED status and allow reset to DRAFT', async () => {
    const pipeline = await prisma.pipeline.create({
      data: {
        tenantId,
        name: 'Failure Flow Test',
        config: {},
        dataSourceId,
        status: PipelineStatus.ACTIVE,
      },
    });

    const failed = await prisma.pipeline.update({
      where: { id: pipeline.id },
      data: { status: PipelineStatus.FAILED },
    });
    expect(failed.status).toBe(PipelineStatus.FAILED);

    const fetched = await prisma.pipeline.findUnique({
      where: { id: pipeline.id },
    });
    expect(fetched?.status).toBe(PipelineStatus.FAILED);

    const draft = await prisma.pipeline.update({
      where: { id: pipeline.id },
      data: { status: PipelineStatus.DRAFT },
    });
    expect(draft.status).toBe(PipelineStatus.DRAFT);
  });
});
