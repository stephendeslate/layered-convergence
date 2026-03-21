import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
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

  describe('SyncRun state transitions', () => {
    it('should create a sync run with pending status', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'pending' },
      });
      expect(syncRun.status).toBe('pending');
    });

    it('should transition pending -> running', async () => {
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

    it('should transition running -> completed', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'running', startedAt: new Date() },
      });

      const allowed = VALID_TRANSITIONS[syncRun.status];
      expect(allowed).toContain('completed');

      const updated = await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'completed', completedAt: new Date(), rowsIngested: 42 },
      });
      expect(updated.status).toBe('completed');
      expect(updated.rowsIngested).toBe(42);
    });

    it('should transition running -> failed', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'running', startedAt: new Date() },
      });

      const updated = await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'failed', completedAt: new Date(), errorLog: 'Connection refused' },
      });
      expect(updated.status).toBe('failed');
      expect(updated.errorLog).toBe('Connection refused');
    });

    it('should transition failed -> pending (retry)', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'failed', errorLog: 'Timeout' },
      });

      const allowed = VALID_TRANSITIONS[syncRun.status];
      expect(allowed).toContain('pending');

      const updated = await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'pending' },
      });
      expect(updated.status).toBe('pending');
    });

    it('should not allow completed -> running per VALID_TRANSITIONS', async () => {
      expect(VALID_TRANSITIONS.completed).not.toContain('running');
      expect(VALID_TRANSITIONS.completed).toHaveLength(0);
    });

    it('should track full state history: pending -> running -> completed', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);

      const sr = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'pending' },
      });
      expect(sr.status).toBe('pending');

      const sr2 = await prisma.syncRun.update({
        where: { id: sr.id },
        data: { status: 'running', startedAt: new Date() },
      });
      expect(sr2.status).toBe('running');

      const sr3 = await prisma.syncRun.update({
        where: { id: sr2.id },
        data: { status: 'completed', completedAt: new Date(), rowsIngested: 100 },
      });
      expect(sr3.status).toBe('completed');
      expect(sr3.rowsIngested).toBe(100);
    });
  });

  describe('DataSource state transitions', () => {
    it('should allow active -> paused', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id, { status: 'active' });

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
    });

    it('should not allow archived -> any state', async () => {
      expect(DATA_SOURCE_TRANSITIONS.archived).toHaveLength(0);
    });
  });
});
