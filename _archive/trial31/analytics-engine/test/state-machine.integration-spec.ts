import { PrismaClient } from '@prisma/client';
import {
  setupTestDatabase,
  teardownTestDatabase,
  truncateAllTables,
  createTestTenant,
  createTestDataSource,
} from './helpers/integration.helper';
import { VALID_TRANSITIONS, DATA_SOURCE_TRANSITIONS } from '../src/common/constants/transitions';

describe('State Machine Integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
  });

  describe('SyncRun state transitions (VALID_TRANSITIONS)', () => {
    it('should create a sync run with pending status', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'pending' },
      });
      expect(syncRun.status).toBe('pending');
    });

    it('should allow pending -> running', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'pending' },
      });

      const allowed = VALID_TRANSITIONS[syncRun.status];
      expect(allowed).toContain('running');

      const updated = await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'running', startedAt: new Date() },
      });
      expect(updated.status).toBe('running');
      expect(updated.startedAt).toBeDefined();
    });

    it('should allow running -> completed', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'running', startedAt: new Date() },
      });

      const allowed = VALID_TRANSITIONS[syncRun.status];
      expect(allowed).toContain('completed');

      const updated = await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'completed', completedAt: new Date(), rowsIngested: 100 },
      });
      expect(updated.status).toBe('completed');
      expect(updated.rowsIngested).toBe(100);
    });

    it('should allow running -> failed', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'running', startedAt: new Date() },
      });

      const allowed = VALID_TRANSITIONS[syncRun.status];
      expect(allowed).toContain('failed');

      const updated = await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'failed', errorLog: 'Connection timeout' },
      });
      expect(updated.status).toBe('failed');
      expect(updated.errorLog).toBe('Connection timeout');
    });

    it('should allow failed -> pending (retry)', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'failed', errorLog: 'timeout' },
      });

      const allowed = VALID_TRANSITIONS[syncRun.status];
      expect(allowed).toContain('pending');

      const updated = await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'pending' },
      });
      expect(updated.status).toBe('pending');
    });

    it('should not allow completed -> any state', () => {
      const allowed = VALID_TRANSITIONS['completed'];
      expect(allowed).toHaveLength(0);
    });

    it('should track state history via ordered sync runs', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);

      await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'pending' },
      });
      await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'running', startedAt: new Date() },
      });
      await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'completed', rowsIngested: 50 },
      });

      const history = await prisma.syncRun.findMany({
        where: { dataSourceId: ds.id },
        orderBy: { createdAt: 'desc' },
      });
      expect(history).toHaveLength(3);
      expect(history[0].status).toBe('completed');
    });
  });

  describe('DataSource state transitions (DATA_SOURCE_TRANSITIONS)', () => {
    it('should create data source with active status', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      expect(ds.status).toBe('active');
    });

    it('should allow active -> paused', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);

      const allowed = DATA_SOURCE_TRANSITIONS[ds.status];
      expect(allowed).toContain('paused');

      const updated = await prisma.dataSource.update({
        where: { id: ds.id },
        data: { status: 'paused' },
      });
      expect(updated.status).toBe('paused');
    });

    it('should allow paused -> active', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id, { status: 'paused' });

      const allowed = DATA_SOURCE_TRANSITIONS[ds.status];
      expect(allowed).toContain('active');

      const updated = await prisma.dataSource.update({
        where: { id: ds.id },
        data: { status: 'active' },
      });
      expect(updated.status).toBe('active');
    });

    it('should allow active -> archived', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);

      const allowed = DATA_SOURCE_TRANSITIONS[ds.status];
      expect(allowed).toContain('archived');

      const updated = await prisma.dataSource.update({
        where: { id: ds.id },
        data: { status: 'archived' },
      });
      expect(updated.status).toBe('archived');
    });

    it('should not allow archived -> any state', () => {
      const allowed = DATA_SOURCE_TRANSITIONS['archived'];
      expect(allowed).toHaveLength(0);
    });
  });
});
