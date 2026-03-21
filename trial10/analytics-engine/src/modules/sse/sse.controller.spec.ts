import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SseController } from './sse.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

describe('SseController', () => {
  let controller: SseController;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {} as PrismaService;
    controller = new SseController(prisma);
  });

  it('should return an observable for dashboard SSE stream', () => {
    const result = controller.streamDashboard('dashboard-1');
    expect(result).toBeDefined();
    expect(result.subscribe).toBeDefined();
  });

  it('should emit events with correct structure including retry field', async () => {
    const observable = controller.streamDashboard('dashboard-1');
    const event = await firstValueFrom(observable.pipe(take(1)));

    expect(event).toHaveProperty('data');
    expect(event).toHaveProperty('id');
    expect(event).toHaveProperty('retry', 5000);

    const parsed = JSON.parse(event.data as string);
    expect(parsed).toHaveProperty('dashboardId', 'dashboard-1');
    expect(parsed).toHaveProperty('timestamp');
    expect(parsed).toHaveProperty('type', 'metric_update');
  });
});
