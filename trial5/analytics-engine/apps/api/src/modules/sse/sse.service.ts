import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface SseEvent {
  dashboardId: string;
  type: string;
  data: unknown;
}

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private readonly subjects = new Map<string, Subject<SseEvent>>();

  getStream(dashboardId: string): Observable<SseEvent> {
    if (!this.subjects.has(dashboardId)) {
      this.subjects.set(dashboardId, new Subject<SseEvent>());
    }
    return this.subjects.get(dashboardId)!.asObservable();
  }

  broadcast(dashboardId: string, type: string, data: unknown) {
    const subject = this.subjects.get(dashboardId);
    if (subject) {
      subject.next({ dashboardId, type, data });
      this.logger.debug(`SSE broadcast to dashboard ${dashboardId}: ${type}`);
    }
  }

  broadcastToAll(type: string, data: unknown) {
    for (const [dashboardId, subject] of this.subjects) {
      subject.next({ dashboardId, type, data });
    }
    this.logger.debug(`SSE broadcast to all ${this.subjects.size} dashboards: ${type}`);
  }

  removeStream(dashboardId: string) {
    const subject = this.subjects.get(dashboardId);
    if (subject) {
      subject.complete();
      this.subjects.delete(dashboardId);
    }
  }
}
