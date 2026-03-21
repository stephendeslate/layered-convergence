import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  TriggerAggregationDto,
  AggregationStatusDto,
} from './dto/trigger-aggregation.dto';

@Injectable()
export class AggregationService {
  private isRunning = false;
  private lastRunAt: Date | null = null;
  private totalAggregated = 0;

  constructor(private readonly prisma: PrismaService) {}

  async triggerAggregation(dto: TriggerAggregationDto): Promise<{ message: string; rowsProcessed: number }> {
    this.isRunning = true;

    try {
      // Count data points for the tenant to simulate aggregation
      const count = await this.prisma.dataPoint.count({
        where: { tenantId: dto.tenantId },
      });

      this.totalAggregated += count;
      this.lastRunAt = new Date();

      return {
        message: `Aggregation completed for tenant ${dto.tenantId}`,
        rowsProcessed: count,
      };
    } finally {
      this.isRunning = false;
    }
  }

  getStatus(): AggregationStatusDto {
    return {
      lastRunAt: this.lastRunAt,
      isRunning: this.isRunning,
      totalAggregated: this.totalAggregated,
    };
  }
}
