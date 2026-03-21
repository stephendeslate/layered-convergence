import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BullMqService, QUEUE_NAMES } from '../bullmq/bullmq.service';

interface PositionRecord {
  companyId: string;
  technicianId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  recordedAt: Date;
}

const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 5000; // Flush every 5 seconds
const RETENTION_DAYS = 90;

@Injectable()
export class GpsHistoryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GpsHistoryService.name);
  private readonly buffer: PositionRecord[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly bullmq: BullMqService,
  ) {}

  async onModuleInit() {
    // Start periodic flush
    this.flushTimer = setInterval(() => {
      this.flush().catch((err) =>
        this.logger.error(`Flush failed: ${err.message}`),
      );
    }, FLUSH_INTERVAL_MS);

    // Register 90-day retention purge cron job (runs daily at 3 AM)
    try {
      const queue = this.bullmq.getQueue(QUEUE_NAMES.REMINDERS);
      await queue.add(
        'gps-position-purge',
        { retentionDays: RETENTION_DAYS },
        {
          repeat: { pattern: '0 3 * * *' }, // daily at 3:00 AM
          jobId: 'gps-position-purge-cron',
        },
      );
      this.logger.log(
        `GPS position purge cron registered (${RETENTION_DAYS}-day retention)`,
      );
    } catch (err: any) {
      this.logger.warn(`Could not register purge cron: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    // Flush remaining on shutdown
    await this.flush();
  }

  /**
   * Add a position to the buffer.
   * When buffer reaches BATCH_SIZE, flush to DB.
   */
  addPosition(record: PositionRecord): void {
    this.buffer.push(record);

    if (this.buffer.length >= BATCH_SIZE) {
      this.flush().catch((err) =>
        this.logger.error(`Batch flush failed: ${err.message}`),
      );
    }
  }

  /**
   * Flush all buffered positions to the database in a single batch insert.
   */
  async flush(): Promise<number> {
    if (this.buffer.length === 0) return 0;

    const batch = this.buffer.splice(0, this.buffer.length);

    try {
      const result = await this.prisma.technicianPosition.createMany({
        data: batch.map((r) => ({
          companyId: r.companyId,
          technicianId: r.technicianId,
          latitude: r.latitude,
          longitude: r.longitude,
          accuracy: r.accuracy,
          heading: r.heading,
          speed: r.speed,
          recordedAt: r.recordedAt,
        })),
      });

      this.logger.debug(`Flushed ${result.count} GPS positions to DB`);
      return result.count;
    } catch (err: any) {
      this.logger.error(`Batch insert failed: ${err.message}`);
      // Put records back for retry
      this.buffer.unshift(...batch);
      return 0;
    }
  }

  /**
   * Query recent positions for a technician (for route replay).
   */
  async getRecentPositions(
    companyId: string,
    technicianId: string,
    hours: number = 8,
    limit: number = 500,
  ) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.prisma.technicianPosition.findMany({
      where: {
        companyId,
        technicianId,
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: 'asc' },
      take: limit,
      select: {
        latitude: true,
        longitude: true,
        accuracy: true,
        heading: true,
        speed: true,
        recordedAt: true,
      },
    });
  }

  /**
   * Get positions between two timestamps (for route replay).
   */
  async getPositionsBetween(
    companyId: string,
    technicianId: string,
    from: Date,
    to: Date,
    limit: number = 1000,
  ) {
    return this.prisma.technicianPosition.findMany({
      where: {
        companyId,
        technicianId,
        recordedAt: { gte: from, lte: to },
      },
      orderBy: { recordedAt: 'asc' },
      take: limit,
      select: {
        latitude: true,
        longitude: true,
        accuracy: true,
        heading: true,
        speed: true,
        recordedAt: true,
      },
    });
  }

  /**
   * Purge positions older than retention period.
   * Called by BullMQ cron job.
   */
  async purgeOldPositions(retentionDays: number = RETENTION_DAYS): Promise<number> {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await this.prisma.technicianPosition.deleteMany({
      where: {
        recordedAt: { lt: cutoff },
      },
    });

    this.logger.log(
      `Purged ${result.count} GPS positions older than ${retentionDays} days`,
    );

    return result.count;
  }

  /**
   * Get buffer size (for monitoring).
   */
  getBufferSize(): number {
    return this.buffer.length;
  }
}
