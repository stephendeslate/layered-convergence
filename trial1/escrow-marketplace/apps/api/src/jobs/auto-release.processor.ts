import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';
import { QUEUE_NAMES } from '../bullmq/bullmq.service';
import { TransactionStatus, AuditAction } from '@prisma/client';

@Injectable()
export class AutoReleaseProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutoReleaseProcessor.name);
  private worker: Worker | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const redisUrl = this.config.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    this.worker = new Worker(
      QUEUE_NAMES.AUTO_RELEASE,
      async (job: Job) => this.process(job),
      {
        connection: { url: redisUrl },
        concurrency: 2,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `Auto-release job ${job?.id} failed: ${err.message}`,
        err.stack,
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`Auto-release job ${job.id} completed`);
    });

    this.logger.log('Auto-release processor started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }

  async process(job: Job<{ transactionId: string }>) {
    const { transactionId } = job.data;
    this.logger.log(`Processing auto-release for transaction ${transactionId}`);

    // Load transaction
    const txn = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        dispute: true,
        provider: { include: { connectedAccount: true } },
      },
    });

    if (!txn) {
      this.logger.warn(
        `Transaction ${transactionId} not found for auto-release`,
      );
      return;
    }

    // Guard: must be in DELIVERED state
    if (txn.status !== TransactionStatus.DELIVERED) {
      this.logger.log(
        `Transaction ${transactionId} is in ${txn.status} state, skipping auto-release`,
      );
      return;
    }

    // Guard: no dispute exists
    if (txn.dispute) {
      this.logger.log(
        `Transaction ${transactionId} has a dispute, skipping auto-release`,
      );
      return;
    }

    // Guard: autoReleaseAt must be in the past
    if (txn.autoReleaseAt && txn.autoReleaseAt.getTime() > Date.now()) {
      this.logger.log(
        `Transaction ${transactionId} auto-release time not yet reached`,
      );
      return;
    }

    // Execute auto-release
    try {
      await this.transactionService.releasePayment(
        transactionId,
        null, // system action
        AuditAction.AUTO_RELEASE_TRIGGERED,
      );
      this.logger.log(
        `Auto-release completed for transaction ${transactionId}`,
      );
    } catch (err) {
      this.logger.error(
        `Auto-release failed for transaction ${transactionId}: ${err}`,
      );
      throw err; // Let BullMQ retry
    }
  }
}
