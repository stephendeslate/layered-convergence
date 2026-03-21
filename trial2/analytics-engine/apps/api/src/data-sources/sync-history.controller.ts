import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { SyncSchedulerService } from '../ingestion/sync-scheduler.service';
import { Request } from 'express';

@Controller('api/v1/data-sources/:dataSourceId/sync')
@UseGuards(AuthGuard)
export class SyncHistoryController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly syncScheduler: SyncSchedulerService,
  ) {}

  @Get('history')
  async getHistory(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('dataSourceId') dataSourceId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = req.user.tenantId;
    const take = Math.min(limit ? parseInt(limit, 10) : 20, 100);

    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
    });
    if (!dataSource) {
      return { data: [], nextCursor: null, hasMore: false };
    }

    const syncRuns = await this.prisma.syncRun.findMany({
      where: { dataSourceId },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { startedAt: 'desc' },
    });

    const hasMore = syncRuns.length > take;
    const data = hasMore ? syncRuns.slice(0, take) : syncRuns;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
  }

  @Post('trigger')
  async triggerSync(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('dataSourceId') dataSourceId: string,
  ) {
    const tenantId = req.user.tenantId;

    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
    });
    if (!dataSource) {
      throw new Error('Data source not found');
    }

    const jobId = await this.syncScheduler.triggerSync(dataSourceId, tenantId);
    return { jobId, message: 'Sync triggered' };
  }
}
