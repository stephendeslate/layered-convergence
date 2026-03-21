import { Injectable } from '@nestjs/common';
import { Observable, Subject, map, filter } from 'rxjs';

export interface SseEvent {
  tenantId: string;
  dashboardId: string;
  data: Record<string, unknown>;
}

@Injectable()
export class SseService {
  private readonly events$ = new Subject<SseEvent>();

  emit(event: SseEvent) {
    this.events$.next(event);
  }

  subscribe(
    tenantId: string,
    dashboardId: string,
  ): Observable<MessageEvent> {
    return this.events$.pipe(
      filter(
        (event) =>
          event.tenantId === tenantId && event.dashboardId === dashboardId,
      ),
      map(
        (event) =>
          ({
            data: JSON.stringify(event.data),
          }) as MessageEvent,
      ),
    );
  }
}
