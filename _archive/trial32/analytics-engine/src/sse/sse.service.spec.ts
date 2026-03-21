import { describe, it, expect, beforeEach } from 'vitest';
import { SseService } from './sse.service.js';
import { firstValueFrom, take, toArray } from 'rxjs';

describe('SseService', () => {
  let service: SseService;

  beforeEach(() => {
    service = new SseService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a stream and emit connected event', async () => {
    const observable = service.getDashboardStream('dash-1');
    const event = await firstValueFrom(observable);
    expect(event.data).toEqual({ type: 'connected', dashboardId: 'dash-1' });
    expect(event.retry).toBe(15000);
  });

  it('should emit events to subscribers', async () => {
    const observable = service.getDashboardStream('dash-1');
    const events: any[] = [];

    const promise = observable.pipe(take(2), toArray()).toPromise();

    setTimeout(() => {
      service.emit('dash-1', { type: 'update', value: 42 });
    }, 10);

    const result = await promise;
    expect(result![0].data).toEqual({
      type: 'connected',
      dashboardId: 'dash-1',
    });
    expect(result![1].data).toEqual({ type: 'update', value: 42 });
  });

  it('should not emit to non-existent streams', () => {
    service.emit('nonexistent', { data: 'test' });
    // Should not throw
  });

  it('should remove stream and complete subject', async () => {
    const observable = service.getDashboardStream('dash-1');
    let completed = false;
    observable.subscribe({
      complete: () => {
        completed = true;
      },
    });

    service.removeStream('dash-1');
    expect(completed).toBe(true);
  });

  it('should handle removing non-existent stream gracefully', () => {
    service.removeStream('nonexistent');
    // Should not throw
  });

  it('should create separate streams for different dashboards', async () => {
    const obs1 = service.getDashboardStream('dash-1');
    const obs2 = service.getDashboardStream('dash-2');

    const event1 = await firstValueFrom(obs1);
    const event2 = await firstValueFrom(obs2);

    expect(event1.data).toEqual({
      type: 'connected',
      dashboardId: 'dash-1',
    });
    expect(event2.data).toEqual({
      type: 'connected',
      dashboardId: 'dash-2',
    });
  });

  it('should emit with retry field set to 15000', async () => {
    service.getDashboardStream('dash-1');
    const events: any[] = [];
    const obs = service.getDashboardStream('dash-1');
    const event = await firstValueFrom(obs);
    expect(event.retry).toBe(15000);
  });
});
