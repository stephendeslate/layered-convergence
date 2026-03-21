import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { PipelineService } from '../src/pipeline/pipeline.service';
import { DataSourceService } from '../src/data-source/data-source.service';

/**
 * Integration test: Pipeline State Machine
 *
 * Tests all valid and invalid state transitions for the pipeline state machine:
 * DRAFT -> ACTIVE
 * ACTIVE -> PAUSED, FAILED, COMPLETED
 * PAUSED -> ACTIVE, FAILED
 * FAILED -> DRAFT
 * COMPLETED -> DRAFT
 *
 * Uses real database (no mocks) — requires running PostgreSQL.
 */
describe('Pipeline State Machine Integration', () => {
  let prisma: PrismaService;
  let pipelineService: PipelineService;
  let dataSourceService: DataSourceService;

  const tenantId = 'pipeline-test-tenant-' + Date.now();
  let dataSourceId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, PipelineService, DataSourceService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    pipelineService = module.get<PipelineService>(PipelineService);
    dataSourceService = module.get<DataSourceService>(DataSourceService);

    await prisma.onModuleInit();

    // Create a data source for pipeline tests
    const ds = await dataSourceService.create(tenantId, {
      name: 'Pipeline Test Source',
      type: 'postgresql',
      config: { host: 'localhost' },
    });
    dataSourceId = ds.id;
  });

  afterAll(async () => {
    await prisma.pipeline.deleteMany({ where: { tenantId } });
    await prisma.dataSource.deleteMany({ where: { tenantId } });
    await prisma.onModuleDestroy();
  });

  async function createPipeline(name: string) {
    return pipelineService.create(tenantId, {
      name,
      config: { steps: ['extract', 'transform', 'load'] },
      dataSourceId,
    });
  }

  // ===== VALID TRANSITIONS =====

  describe('Valid transitions', () => {
    it('should transition DRAFT -> ACTIVE', async () => {
      const pipeline = await createPipeline('DRAFT to ACTIVE');
      expect(pipeline.status).toBe('DRAFT');

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });

      expect(result.status).toBe('ACTIVE');
    });

    it('should transition ACTIVE -> PAUSED', async () => {
      const pipeline = await createPipeline('ACTIVE to PAUSED');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'PAUSED',
      });

      expect(result.status).toBe('PAUSED');
    });

    it('should transition ACTIVE -> FAILED', async () => {
      const pipeline = await createPipeline('ACTIVE to FAILED');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'FAILED',
      });

      expect(result.status).toBe('FAILED');
    });

    it('should transition ACTIVE -> COMPLETED', async () => {
      const pipeline = await createPipeline('ACTIVE to COMPLETED');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'COMPLETED',
      });

      expect(result.status).toBe('COMPLETED');
    });

    it('should transition PAUSED -> ACTIVE', async () => {
      const pipeline = await createPipeline('PAUSED to ACTIVE');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'PAUSED',
      });

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });

      expect(result.status).toBe('ACTIVE');
    });

    it('should transition PAUSED -> FAILED', async () => {
      const pipeline = await createPipeline('PAUSED to FAILED');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'PAUSED',
      });

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'FAILED',
      });

      expect(result.status).toBe('FAILED');
    });

    it('should transition FAILED -> DRAFT', async () => {
      const pipeline = await createPipeline('FAILED to DRAFT');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'FAILED',
      });

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'DRAFT',
      });

      expect(result.status).toBe('DRAFT');
    });

    it('should transition COMPLETED -> DRAFT', async () => {
      const pipeline = await createPipeline('COMPLETED to DRAFT');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'COMPLETED',
      });

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'DRAFT',
      });

      expect(result.status).toBe('DRAFT');
    });
  });

  // ===== INVALID TRANSITIONS =====

  describe('Invalid transitions', () => {
    it('should reject DRAFT -> PAUSED', async () => {
      const pipeline = await createPipeline('No DRAFT->PAUSED');

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'PAUSED',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject DRAFT -> FAILED', async () => {
      const pipeline = await createPipeline('No DRAFT->FAILED');

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'FAILED',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject DRAFT -> COMPLETED', async () => {
      const pipeline = await createPipeline('No DRAFT->COMPLETED');

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'COMPLETED',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject DRAFT -> DRAFT (self-transition)', async () => {
      const pipeline = await createPipeline('No DRAFT->DRAFT');

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'DRAFT',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ACTIVE -> DRAFT', async () => {
      const pipeline = await createPipeline('No ACTIVE->DRAFT');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'DRAFT',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ACTIVE -> ACTIVE (self-transition)', async () => {
      const pipeline = await createPipeline('No ACTIVE->ACTIVE');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'ACTIVE',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject PAUSED -> PAUSED (self-transition)', async () => {
      const pipeline = await createPipeline('No PAUSED->PAUSED');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'PAUSED',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'PAUSED',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject PAUSED -> COMPLETED', async () => {
      const pipeline = await createPipeline('No PAUSED->COMPLETED');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'PAUSED',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'COMPLETED',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject PAUSED -> DRAFT', async () => {
      const pipeline = await createPipeline('No PAUSED->DRAFT');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'PAUSED',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'DRAFT',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED -> ACTIVE', async () => {
      const pipeline = await createPipeline('No COMPLETED->ACTIVE');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'COMPLETED',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'ACTIVE',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED -> PAUSED', async () => {
      const pipeline = await createPipeline('No COMPLETED->PAUSED');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'COMPLETED',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'PAUSED',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED -> ACTIVE', async () => {
      const pipeline = await createPipeline('No FAILED->ACTIVE');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'FAILED',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'ACTIVE',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED -> PAUSED', async () => {
      const pipeline = await createPipeline('No FAILED->PAUSED');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'FAILED',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'PAUSED',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED -> COMPLETED', async () => {
      const pipeline = await createPipeline('No FAILED->COMPLETED');
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'FAILED',
      });

      await expect(
        pipelineService.transition(tenantId, pipeline.id, {
          targetStatus: 'COMPLETED',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===== FULL LIFECYCLE =====

  describe('Full lifecycle', () => {
    it('should support complete pipeline lifecycle: DRAFT -> ACTIVE -> COMPLETED -> DRAFT', async () => {
      const pipeline = await createPipeline('Full Lifecycle');

      expect(pipeline.status).toBe('DRAFT');

      const active = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      expect(active.status).toBe('ACTIVE');

      const completed = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'COMPLETED',
      });
      expect(completed.status).toBe('COMPLETED');

      const reset = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'DRAFT',
      });
      expect(reset.status).toBe('DRAFT');
    });

    it('should support retry lifecycle: DRAFT -> ACTIVE -> FAILED -> DRAFT -> ACTIVE -> COMPLETED', async () => {
      const pipeline = await createPipeline('Retry Lifecycle');

      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'FAILED',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'DRAFT',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'COMPLETED',
      });

      expect(result.status).toBe('COMPLETED');
    });

    it('should support pause/resume: DRAFT -> ACTIVE -> PAUSED -> ACTIVE -> COMPLETED', async () => {
      const pipeline = await createPipeline('Pause Resume');

      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'PAUSED',
      });
      await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'ACTIVE',
      });

      const result = await pipelineService.transition(tenantId, pipeline.id, {
        targetStatus: 'COMPLETED',
      });

      expect(result.status).toBe('COMPLETED');
    });
  });
});
