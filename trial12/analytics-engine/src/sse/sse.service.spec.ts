import { SseService } from './sse.service.js';
import { firstValueFrom, take, toArray } from 'rxjs';

describe('SseService', () => {
  let service: SseService;

  beforeEach(() => {
    service = new SseService();
  });

  it('should create a stream for a dashboard', async () => {
    const stream = service.getDashboardStream('d1');
    expect(stream).toBeDefined();

    const firstEvent = await firstValueFrom(stream);
    expect(firstEvent.data).toEqual({
      type: 'connected',
      dashboardId: 'd1',
    });
    expect(firstEvent.retry).toBe(15000);
  });

  it('should emit events to subscribers', async () => {
    const stream = service.getDashboardStream('d2');

    // Collect 2 events (connected + emitted), then complete
    const eventsPromise = firstValueFrom(stream.pipe(take(2), toArray()));

    // Emit after subscribing
    service.emit('d2', { updated: true });

    const events = await eventsPromise;
    expect(events).toHaveLength(2);
    expect(events[0].data.type).toBe('connected');
    expect(events[1].data.updated).toBe(true);
    expect(events[1].retry).toBe(15000);
  });

  it('should remove stream', () => {
    service.getDashboardStream('d3');
    service.removeStream('d3');
    // Emitting to removed stream should not throw
    service.emit('d3', { data: 'test' });
  });
});
