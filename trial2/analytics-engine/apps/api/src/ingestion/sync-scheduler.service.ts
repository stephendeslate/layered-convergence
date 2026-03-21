import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { IngestionService } from './ingestion.service';

interface SyncJobData {
  dataSourceId: string;
  tenantId: string;
}

@Injectable()
export class SyncSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SyncSchedulerService.name);
  private queue: Queue<SyncJobData>;
  private worker: Worker<SyncJobData>;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly ingestionService: IngestionService,
  ) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    const connection = { host: redisHost, port: redisPort };

    this.queue = new Queue<SyncJobData>('sync', { connection });

    this.worker = new Worker<SyncJobData>(
      'sync',
      async (job: Job<SyncJobData>) => {
        this.logger.log(`Processing sync job: ${job.id} for dataSource: ${job.data.dataSourceId}`);
        await this.ingestionService.runSync(job.data.dataSourceId);
      },
      {
        connection,
        concurrency: 5,
      },
    );

    this.worker.on('completed', (job: Job<SyncJobData>) => {
      this.logger.log(`Sync job completed: ${job.id}`);
    });

    this.worker.on('failed', (job: Job<SyncJobData> | undefined, error: Error) => {
      this.logger.error(`Sync job failed: ${job?.id}: ${error.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.registerScheduledJobs();
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
  }

  async registerScheduledJobs(): Promise<void> {
    const dataSources = await this.prisma.dataSource.findMany({
      where: { isActive: true },
      include: { config: true },
    });

    for (const ds of dataSources) {
      if (ds.config?.syncSchedule) {
        await this.scheduleSync(ds.id, ds.tenantId, ds.config.syncSchedule);
      }
    }

    this.logger.log(`Registered ${dataSources.filter((ds) => ds.config?.syncSchedule).length} scheduled sync jobs`);
  }

  async scheduleSync(dataSourceId: string, tenantId: string, cronExpression: string): Promise<void> {
    const jobId = `sync-${dataSourceId}`;

    await this.queue.upsertJobScheduler(
      jobId,
      { pattern: cronExpression },
      {
        name: 'sync',
        data: { dataSourceId, tenantId },
      },
    );

    this.logger.log(`Scheduled sync for ${dataSourceId} with cron: ${cronExpression}`);
  }

  async triggerSync(dataSourceId: string, tenantId: string): Promise<string> {
    const job = await this.queue.add('sync', { dataSourceId, tenantId });
    this.logger.log(`Manually triggered sync for ${dataSourceId}, job: ${job.id}`);
    return job.id ?? '';
  }

  async removeSchedule(dataSourceId: string): Promise<void> {
    const jobId = `sync-${dataSourceId}`;
    await this.queue.removeJobScheduler(jobId);
    this.logger.log(`Removed sync schedule for ${dataSourceId}`);
  }
}
