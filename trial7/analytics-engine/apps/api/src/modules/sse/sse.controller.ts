import { Controller, Param, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService } from './sse.service';

/**
 * SSE endpoint for real-time dashboard updates.
 *
 * ## Reconnection Strategy (Convention 5.23)
 *
 * **Last-Event-ID: NOT SUPPORTED**
 *
 * This endpoint streams live metric updates for a specific dashboard.
 * When a client disconnects and reconnects, it will miss any events
 * published during the disconnection window. The client should:
 *
 * 1. On reconnection, fetch the latest dashboard data via GET /dashboards/:id
 * 2. Resume receiving live updates from the SSE stream
 *
 * Browser SSE clients automatically reconnect (default ~3 seconds).
 * The server does not maintain per-client event buffers.
 */
@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse(':dashboardId')
  stream(@Param('dashboardId') dashboardId: string): Observable<MessageEvent> {
    return this.sseService.subscribe(dashboardId);
  }
}
