import { Controller, Param, Sse, UseGuards, Logger, MessageEvent } from '@nestjs/common';
import { Observable, interval, map, startWith } from 'rxjs';
import { AggregationService } from '../aggregation/aggregation.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

/**
 * SSE controller for real-time dashboard updates.
 * Pushes updated aggregation data at configurable intervals.
 *
 * Reconnection: Clients should set EventSource.reconnectInterval or
 * handle the 'error' event to reconnect. The server sends a `retry:` field
 * in the initial response to suggest a 10-second reconnection interval.
 */
@Controller('sse')
export class SseController {
  private readonly logger = new Logger(SseController.name);
  private readonly PUSH_INTERVAL_MS = 10_000; // 10 seconds

  constructor(private readonly aggregationService: AggregationService) {}

  @Sse('dashboard/:dashboardId')
  @UseGuards(ApiKeyGuard)
  streamDashboard(
    @Param('dashboardId') dashboardId: string,
    @CurrentTenant() tenant: { id: string },
  ): Observable<MessageEvent> {
    this.logger.log(`SSE connection opened for dashboard ${dashboardId}`);

    return interval(this.PUSH_INTERVAL_MS).pipe(
      startWith(0),
      map((tick) => ({
        data: {
          dashboardId,
          tenantId: tenant.id,
          timestamp: new Date().toISOString(),
          tick,
        },
        type: 'dashboard-update',
        retry: this.PUSH_INTERVAL_MS,
      })),
    );
  }
}
