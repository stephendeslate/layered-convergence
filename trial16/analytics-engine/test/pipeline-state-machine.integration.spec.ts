import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PipelineService } from '../src/pipeline/pipeline.service';
import { PipelineState } from '@prisma/client';

describe('Pipeline State Machine (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let pipelineService: PipelineService;
  const tenantId = 'tenant-pipeline-test';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    pipelineService = app.get(PipelineService);
  });

  afterAll(async () => {
    await prisma.pipeline.deleteMany({ where: { tenantId } });
    await prisma.dataSource.deleteMany({ where: { tenantId } });
    await app.close();
  });

  it('should follow IDLE → RUNNING → COMPLETED → IDLE lifecycle', async () => {
    const dataSource = await prisma.dataSource.create({
      data: {
        tenantId,
        name: 'Test DS',
        type: 'POSTGRESQL',
        config: { host: 'localhost' },
      },
    });

    const pipeline = await pipelineService.create(tenantId, {
      name: 'Test Pipeline',
      dataSourceId: dataSource.id,
    });

    expect(pipeline.state).toBe(PipelineState.IDLE);

    const running = await pipelineService.transition(tenantId, pipeline.id, {
      state: PipelineState.RUNNING,
    });
    expect(running.state).toBe(PipelineState.RUNNING);

    const completed = await pipelineService.transition(tenantId, pipeline.id, {
      state: PipelineState.COMPLETED,
    });
    expect(completed.state).toBe(PipelineState.COMPLETED);

    const idle = await pipelineService.transition(tenantId, pipeline.id, {
      state: PipelineState.IDLE,
    });
    expect(idle.state).toBe(PipelineState.IDLE);
  });

  it('should follow IDLE → RUNNING → FAILED → IDLE lifecycle', async () => {
    const dataSource = await prisma.dataSource.create({
      data: {
        tenantId,
        name: 'Test DS 2',
        type: 'MYSQL',
        config: { host: 'localhost' },
      },
    });

    const pipeline = await pipelineService.create(tenantId, {
      name: 'Fail Pipeline',
      dataSourceId: dataSource.id,
    });

    await pipelineService.transition(tenantId, pipeline.id, {
      state: PipelineState.RUNNING,
    });

    const failed = await pipelineService.transition(tenantId, pipeline.id, {
      state: PipelineState.FAILED,
      errorMessage: 'Connection timeout',
    });

    expect(failed.state).toBe(PipelineState.FAILED);

    const reset = await pipelineService.transition(tenantId, pipeline.id, {
      state: PipelineState.IDLE,
    });
    expect(reset.state).toBe(PipelineState.IDLE);
  });

  it('should reject invalid transitions', async () => {
    const dataSource = await prisma.dataSource.create({
      data: {
        tenantId,
        name: 'Test DS 3',
        type: 'CSV',
        config: {},
      },
    });

    const pipeline = await pipelineService.create(tenantId, {
      name: 'Invalid Transition Pipeline',
      dataSourceId: dataSource.id,
    });

    await expect(
      pipelineService.transition(tenantId, pipeline.id, {
        state: PipelineState.COMPLETED,
      }),
    ).rejects.toThrow('Invalid state transition');

    await expect(
      pipelineService.transition(tenantId, pipeline.id, {
        state: PipelineState.FAILED,
      }),
    ).rejects.toThrow('Invalid state transition');
  });
});
