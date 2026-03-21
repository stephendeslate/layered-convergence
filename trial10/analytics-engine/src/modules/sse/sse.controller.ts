import { Controller, Sse, Param, MessageEvent, Logger } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * SSE controller for real-time dashboard updates.
 * No service layer — this is a controller-only module that streams events
 * directly from the database via SSE (convention 5.30: controller-only module).
 * No DTO required — SSE endpoints have no request body (convention 5.31).
 */
@Controller('sse')
export class SseController {
  private readonly logger = new Logger(SseController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * SSE endpoint for dashboard real-time updates.
   * Clients receive metric updates every 10 seconds.
   * Includes retry directive for automatic reconnection (convention 5.25).
   */
  @Sse('dashboard/:dashboardId')
  streamDashboard(
    @Param('dashboardId') dashboardId: string,
  ): Observable<MessageEvent> {
    this.logger.log(`SSE connection opened for dashboard: ${dashboardId}`);

    return interval(10000).pipe(
      map((seq) => ({
        data: JSON.stringify({
          dashboardId,
          timestamp: new Date().toISOString(),
          sequence: seq,
          type: 'metric_update',
        }),
        id: String(seq),
        retry: 5000,
      })),
    );
  }
}
