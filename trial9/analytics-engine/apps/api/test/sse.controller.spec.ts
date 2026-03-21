import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SseController } from '../src/modules/sse/sse.controller';
import { AggregationService } from '../src/modules/aggregation/aggregation.service';
import { firstValueFrom } from 'rxjs';

describe('SseController', () => {
  let controller: SseController;
  let mockAggregationService: Partial<AggregationService>;

  beforeEach(() => {
    mockAggregationService = {
      aggregate: vi.fn().mockResolvedValue([]),
    };
    controller = new SseController(mockAggregationService as AggregationService);
  });

  it('should return an Observable that emits dashboard updates', async () => {
    const tenant = { id: 'tenant-1' };
    const observable = controller.streamDashboard('dashboard-1', tenant);

    expect(observable).toBeDefined();
    expect(observable.subscribe).toBeDefined();

    const firstEvent = await firstValueFrom(observable);
    expect(firstEvent.data).toEqual(
      expect.objectContaining({
        dashboardId: 'dashboard-1',
        tenantId: 'tenant-1',
      }),
    );
    expect(firstEvent.type).toBe('dashboard-update');
  });

  it('should include retry field for SSE reconnection', async () => {
    const tenant = { id: 'tenant-1' };
    const observable = controller.streamDashboard('dashboard-1', tenant);

    const firstEvent = await firstValueFrom(observable);
    expect(firstEvent.retry).toBe(10_000);
  });
});
