import { firstValueFrom } from 'rxjs';
import { SseService } from './sse.service.js';

describe('SseService', () => {
  let service: SseService;

  beforeEach(() => {
    service = new SseService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should return an observable', () => {
      const observable = service.subscribe('dash-1');
      expect(observable).toBeDefined();
      expect(observable.subscribe).toBeDefined();
    });
  });

  describe('pushUpdate', () => {
    it('should push an update to subscribers', async () => {
      const observable = service.subscribe('dash-1');
      const eventPromise = firstValueFrom(observable);

      service.pushUpdate('dash-1', { metric: 'revenue', value: 100 });

      const event = await eventPromise;
      const parsed = JSON.parse(event.data);
      expect(parsed.data).toEqual({ metric: 'revenue', value: 100 });
      expect(parsed.retry).toBe(10000);
    });

    it('should not throw when no subscribers exist', () => {
      expect(() =>
        service.pushUpdate('no-dashboard', { data: 'test' }),
      ).not.toThrow();
    });
  });

  describe('removeSubscription', () => {
    it('should complete the observable', async () => {
      const observable = service.subscribe('dash-1');
      let completed = false;

      const subscription = observable.subscribe({
        complete: () => {
          completed = true;
        },
      });

      service.removeSubscription('dash-1');
      subscription.unsubscribe();

      expect(completed).toBe(true);
    });

    it('should not throw when removing non-existent subscription', () => {
      expect(() => service.removeSubscription('no-dashboard')).not.toThrow();
    });
  });
});
