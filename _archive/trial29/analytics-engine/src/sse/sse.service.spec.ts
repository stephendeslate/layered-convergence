import { Test } from '@nestjs/testing';
import { SseService } from './sse.service.js';
import { firstValueFrom, take, toArray } from 'rxjs';

describe('SseService', () => {
  let service: SseService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SseService],
    }).compile();

    service = module.get(SseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStream', () => {
    it('should return an observable', () => {
      const stream = service.getDashboardStream('d1');
      expect(stream).toBeDefined();
      expect(typeof stream.subscribe).toBe('function');
    });

    it('should emit a connected event on subscribe', async () => {
      const stream = service.getDashboardStream('d1');
      const event = await firstValueFrom(stream);
      expect(event.data).toEqual({ type: 'connected', dashboardId: 'd1' });
      expect(event.retry).toBe(15000);
    });
  });

  describe('emit', () => {
    it('should emit data to subscribers', async () => {
      const stream = service.getDashboardStream('d1');
      const eventsPromise = firstValueFrom(
        stream.pipe(take(2), toArray()),
      );

      service.emit('d1', { type: 'update', widgetId: 'w1' });

      const events = await eventsPromise;
      expect(events).toHaveLength(2);
      expect(events[0].data).toEqual({ type: 'connected', dashboardId: 'd1' });
      expect(events[1].data).toEqual({ type: 'update', widgetId: 'w1' });
    });

    it('should not throw when emitting to a non-existent stream', () => {
      expect(() =>
        service.emit('nonexistent', { type: 'test' }),
      ).not.toThrow();
    });
  });

  describe('removeStream', () => {
    it('should complete the stream and remove it', () => {
      const stream = service.getDashboardStream('d1');
      let completed = false;
      stream.subscribe({ complete: () => (completed = true) });

      service.removeStream('d1');
      expect(completed).toBe(true);
    });

    it('should not throw when removing a non-existent stream', () => {
      expect(() => service.removeStream('nonexistent')).not.toThrow();
    });
  });
});
