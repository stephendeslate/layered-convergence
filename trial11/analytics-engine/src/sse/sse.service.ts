import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface SseEvent {
  dashboardId: string;
  data: unknown;
}

@Injectable()
export class SseService {
  private readonly subjects = new Map<string, Subject<MessageEvent>>();

  subscribe(dashboardId: string): Observable<MessageEvent> {
    if (!this.subjects.has(dashboardId)) {
      this.subjects.set(dashboardId, new Subject<MessageEvent>());
    }
    // type assertion justified: Map.get after Map.has guarantees non-undefined
    return this.subjects.get(dashboardId)!.asObservable();
  }

  pushUpdate(dashboardId: string, data: unknown) {
    const subject = this.subjects.get(dashboardId);
    if (subject) {
      // Convention 5.25: SSE endpoints include retry field
      const event = new MessageEvent('message', {
        data: JSON.stringify({ data, retry: 10000 }),
      });
      subject.next(event);
    }
  }

  removeSubscription(dashboardId: string) {
    const subject = this.subjects.get(dashboardId);
    if (subject) {
      subject.complete();
      this.subjects.delete(dashboardId);
    }
  }
}
