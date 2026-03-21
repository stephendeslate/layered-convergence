import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private readonly subjects = new Map<string, Subject<MessageEvent>>();

  getDashboardStream(dashboardId: string): Observable<MessageEvent> {
    if (!this.subjects.has(dashboardId)) {
      this.subjects.set(dashboardId, new Subject<MessageEvent>());
    }

    return new Observable<MessageEvent>((subscriber) => {
      const subject = this.subjects.get(dashboardId)!;
      const subscription = subject.subscribe(subscriber);

      subscriber.next({
        data: { type: 'connected', dashboardId },
        retry: 15000,
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  emit(dashboardId: string, data: Record<string, any>) {
    const subject = this.subjects.get(dashboardId);
    if (subject) {
      subject.next({
        data,
        retry: 15000,
      });
    }
  }

  removeStream(dashboardId: string) {
    const subject = this.subjects.get(dashboardId);
    if (subject) {
      subject.complete();
      this.subjects.delete(dashboardId);
    }
  }
}
