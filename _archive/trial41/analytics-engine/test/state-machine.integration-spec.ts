import { Pool } from 'pg';
import { PrismaClient, PipelineStatus } from '@prisma/client';
import {
  createTestPool,
  createTestPrisma,
  cleanDatabase,
  createTestTenant,
  createTestDataSource,
} from './helpers';

describe('Pipeline State Machine (Integration)', () => {
  let pool: Pool;
  let prisma: PrismaClient;

  beforeAll(async () => {
    pool = createTestPool();
    prisma = createTestPrisma(pool);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await cleanDatabase(pool);
  });

  it('should create data source with DRAFT status', async () => {
    const tenant = await createTestTenant(prisma, { name: 'SM Tenant' });
    const ds = await createTestDataSource(prisma, tenant.id);

    expect(ds.pipelineStatus).toBe(PipelineStatus.DRAFT);
  });

  it('should support full lifecycle: DRAFT -> ACTIVE -> PAUSED -> ARCHIVED', async () => {
    const tenant = await createTestTenant(prisma, { name: 'Lifecycle Tenant' });
    const ds = await createTestDataSource(prisma, tenant.id);

    const statuses: PipelineStatus[] = [
      PipelineStatus.ACTIVE,
      PipelineStatus.PAUSED,
      PipelineStatus.ARCHIVED,
    ];

    let current = ds;
    for (const nextStatus of statuses) {
      current = await prisma.dataSource.update({
        where: { id: current.id },
        data: { pipelineStatus: nextStatus },
      });
    }

    const final = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(final!.pipelineStatus).toBe(PipelineStatus.ARCHIVED);
  });

  it('should support DRAFT -> ACTIVE -> ARCHIVED (skip PAUSED)', async () => {
    const tenant = await createTestTenant(prisma, { name: 'Skip Paused Tenant' });
    const ds = await createTestDataSource(prisma, tenant.id);

    await prisma.dataSource.update({
      where: { id: ds.id },
      data: { pipelineStatus: PipelineStatus.ACTIVE },
    });

    await prisma.dataSource.update({
      where: { id: ds.id },
      data: { pipelineStatus: PipelineStatus.ARCHIVED },
    });

    const final = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(final!.pipelineStatus).toBe(PipelineStatus.ARCHIVED);
  });

  it('should support PAUSED -> ACTIVE (resume)', async () => {
    const tenant = await createTestTenant(prisma, { name: 'Resume Tenant' });
    const ds = await createTestDataSource(prisma, tenant.id, { pipelineStatus: 'PAUSED' });

    const resumed = await prisma.dataSource.update({
      where: { id: ds.id },
      data: { pipelineStatus: PipelineStatus.ACTIVE },
    });

    expect(resumed.pipelineStatus).toBe(PipelineStatus.ACTIVE);
  });

  it('should record sync runs during active pipeline', async () => {
    const tenant = await createTestTenant(prisma, { name: 'Sync Tenant' });
    const ds = await createTestDataSource(prisma, tenant.id, { pipelineStatus: 'ACTIVE' });

    await prisma.syncRun.create({
      data: {
        dataSourceId: ds.id,
        status: 'RUNNING',
      },
    });

    await prisma.syncRun.create({
      data: {
        dataSourceId: ds.id,
        status: 'COMPLETED',
        rowsIngested: 150,
        completedAt: new Date(),
      },
    });

    const runs = await prisma.syncRun.findMany({
      where: { dataSourceId: ds.id },
    });
    expect(runs).toHaveLength(2);
  });
});
