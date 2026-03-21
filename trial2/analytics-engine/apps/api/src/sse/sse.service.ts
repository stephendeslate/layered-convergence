import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable, filter, map } from 'rxjs';
import { SseEvent } from '@analytics-engine/shared';

interface SseSubscription {
  tenantId: string;
  dashboardId: string;
}

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private readonly events$ = new Subject<{ tenantId: string; dashboardId: string; event: SseEvent }>();

  subscribe(
    tenantId: string,
    dashboardId: string,
  ): Observable<MessageEvent> {
    this.logger.debug(`SSE subscription: tenant=${tenantId}, dashboard=${dashboardId}`);

    return this.events$.pipe(
      filter(
        (e) => e.tenantId === tenantId && e.dashboardId === dashboardId,
      ),
      map(
        (e) =>
          new MessageEvent('message', {
            data: JSON.stringify(e.event),
          }),
      ),
    );
  }

  emit(tenantId: string, dashboardId: string, event: SseEvent): void {
    this.events$.next({ tenantId, dashboardId, event });
    this.logger.debug(
      `SSE event emitted: type=${event.type}, tenant=${tenantId}, dashboard=${dashboardId}`,
    );
  }

  emitWidgetUpdate(
    tenantId: string,
    dashboardId: string,
    widgetId: string,
    data: Record<string, unknown>,
  ): void {
    this.emit(tenantId, dashboardId, {
      type: 'update',
      widgetId,
      data,
    });
  }
}
