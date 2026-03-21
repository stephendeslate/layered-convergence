import { Controller, Sse, Param, MessageEvent } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { SseService } from './sse.service';

/**
 * SSE endpoint for real-time dashboard metric updates.
 *
 * Note: `Last-Event-ID` header for reconnection is NOT supported.
 * Clients reconnecting after a disconnect will receive the current
 * data snapshot, not a replay of missed events. This is acceptable
 * because dashboard data is derived from aggregated time-bucketed
 * summaries — no individual events are lost, and the next poll
 * returns the current state.
 */
@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('dashboard/:dashboardId')
  streamDashboard(
    @Param('dashboardId') dashboardId: string,
  ): Observable<MessageEvent> {
    return interval(10000).pipe(
      map(() => this.sseService.getDashboardUpdate(dashboardId)),
      map((data) => ({ data }) as MessageEvent),
    );
  }
}
