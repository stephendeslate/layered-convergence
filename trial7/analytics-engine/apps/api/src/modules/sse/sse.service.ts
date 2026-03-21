import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface SseEvent {
  tenantId: string;
  dashboardId: string;
  type: string;
  data: Record<string, unknown>;
}

/**
 * SSE (Server-Sent Events) service for real-time dashboard updates.
 *
 * ## Reconnection Behavior (Convention 5.23)
 *
 * This implementation uses in-memory RxJS Subjects for event distribution.
 * **Last-Event-ID is NOT supported.** Events published while a client is
 * disconnected will be lost. This is acceptable for real-time dashboard
 * updates where:
 * - Data is periodically refreshed on reconnection via REST API
 * - Stale data is replaced by the next SSE event within seconds
 * - Event completeness is not required for dashboard correctness
 *
 * If event completeness becomes a requirement, implement a bounded event
 * buffer keyed by dashboardId with configurable retention (e.g., 5 minutes).
 */
@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private readonly subject = new Subject<SseEvent>();

  publish(event: SseEvent): void {
    this.logger.debug(
      `Publishing SSE event type=${event.type} for dashboard=${event.dashboardId}`,
    );
    this.subject.next(event);
  }

  subscribe(dashboardId: string): Observable<MessageEvent> {
    return this.subject.pipe(
      filter((event) => event.dashboardId === dashboardId),
      map(
        (event) =>
          ({
            data: JSON.stringify({
              type: event.type,
              data: event.data,
              timestamp: new Date().toISOString(),
            }),
          }) as MessageEvent,
      ),
    );
  }
}
