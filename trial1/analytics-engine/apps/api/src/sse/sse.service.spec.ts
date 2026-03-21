import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SseService } from './sse.service';

function createMockResponse() {
  const written: string[] = [];
  return {
    writeHead: vi.fn(),
    write: vi.fn((data: string) => {
      written.push(data);
      return true;
    }),
    end: vi.fn(),
    on: vi.fn(),
    writableEnded: false,
    _written: written,
  };
}

describe('SseService', () => {
  let service: SseService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new SseService();
  });

  afterEach(() => {
    service.removeAllConnections();
    vi.useRealTimers();
  });

  describe('subscribe', () => {
    it('should set SSE headers and return a connection ID', () => {
      const res = createMockResponse();

      const connectionId = service.subscribe('dash-1', 'tenant-1', res as any);

      expect(connectionId).toBeDefined();
      expect(typeof connectionId).toBe('string');
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
    });

    it('should send initial connection-status event', () => {
      const res = createMockResponse();

      service.subscribe('dash-1', 'tenant-1', res as any);

      const allWritten = res._written.join('');
      expect(allWritten).toContain('event: connection-status');
      expect(allWritten).toContain('"status":"connected"');
    });

    it('should register a close listener for cleanup', () => {
      const res = createMockResponse();

      service.subscribe('dash-1', 'tenant-1', res as any);

      expect(res.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('should track connection count for dashboard', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      service.subscribe('dash-1', 'tenant-1', res1 as any);
      service.subscribe('dash-1', 'tenant-1', res2 as any);

      expect(service.getConnectionCount('dash-1')).toBe(2);
      expect(service.getTotalConnectionCount()).toBe(2);
    });
  });

  describe('broadcast', () => {
    it('should send event to all subscribers of a dashboard', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      service.subscribe('dash-1', 'tenant-1', res1 as any);
      service.subscribe('dash-1', 'tenant-1', res2 as any);

      const sent = service.broadcast('dash-1', {
        type: 'test-event',
        data: '{"hello":"world"}',
      });

      expect(sent).toBe(2);
      // Both responses should have received the event
      expect(res1._written.join('')).toContain('event: test-event');
      expect(res2._written.join('')).toContain('event: test-event');
    });

    it('should return 0 for dashboard with no subscribers', () => {
      const sent = service.broadcast('nonexistent', {
        type: 'test',
        data: '{}',
      });

      expect(sent).toBe(0);
    });

    it('should not send to subscribers of other dashboards', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      service.subscribe('dash-1', 'tenant-1', res1 as any);
      service.subscribe('dash-2', 'tenant-1', res2 as any);

      // Clear writes from subscribe
      res1._written.length = 0;
      res2._written.length = 0;
      res1.write.mockClear();
      res2.write.mockClear();

      service.broadcast('dash-1', {
        type: 'test-event',
        data: '{}',
      });

      expect(res1.write).toHaveBeenCalled();
      expect(res2.write).not.toHaveBeenCalled();
    });
  });

  describe('broadcastWidgetUpdate', () => {
    it('should broadcast a widget-update event with widgetId and data', () => {
      const res = createMockResponse();
      service.subscribe('dash-1', 'tenant-1', res as any);

      res._written.length = 0;

      const sent = service.broadcastWidgetUpdate('dash-1', 'widget-1', {
        value: 42,
      });

      expect(sent).toBe(1);
      const allWritten = res._written.join('');
      expect(allWritten).toContain('event: widget-update');
      expect(allWritten).toContain('"widgetId":"widget-1"');
    });
  });

  describe('broadcastDashboardRefresh', () => {
    it('should broadcast a dashboard-refresh event with reason', () => {
      const res = createMockResponse();
      service.subscribe('dash-1', 'tenant-1', res as any);

      res._written.length = 0;

      const sent = service.broadcastDashboardRefresh('dash-1', 'sync-complete');

      expect(sent).toBe(1);
      const allWritten = res._written.join('');
      expect(allWritten).toContain('event: dashboard-refresh');
      expect(allWritten).toContain('"reason":"sync-complete"');
    });
  });

  describe('removeConnection', () => {
    it('should remove a connection and decrement counts', () => {
      const res = createMockResponse();

      const connectionId = service.subscribe('dash-1', 'tenant-1', res as any);

      expect(service.getTotalConnectionCount()).toBe(1);

      service.removeConnection(connectionId);

      expect(service.getTotalConnectionCount()).toBe(0);
      expect(service.getConnectionCount('dash-1')).toBe(0);
    });

    it('should end the response stream', () => {
      const res = createMockResponse();

      const connectionId = service.subscribe('dash-1', 'tenant-1', res as any);
      service.removeConnection(connectionId);

      expect(res.end).toHaveBeenCalled();
    });

    it('should be a no-op for unknown connection IDs', () => {
      expect(() => service.removeConnection('nonexistent')).not.toThrow();
    });

    it('should clean up dashboard subscriber set when last connection removed', () => {
      const res = createMockResponse();

      const connectionId = service.subscribe('dash-1', 'tenant-1', res as any);
      service.removeConnection(connectionId);

      // Broadcasting to this dashboard should return 0
      const sent = service.broadcast('dash-1', { type: 'test', data: '{}' });
      expect(sent).toBe(0);
    });
  });

  describe('removeAllConnections', () => {
    it('should remove all active connections', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      const res3 = createMockResponse();

      service.subscribe('dash-1', 'tenant-1', res1 as any);
      service.subscribe('dash-1', 'tenant-1', res2 as any);
      service.subscribe('dash-2', 'tenant-1', res3 as any);

      expect(service.getTotalConnectionCount()).toBe(3);

      service.removeAllConnections();

      expect(service.getTotalConnectionCount()).toBe(0);
    });
  });
});
