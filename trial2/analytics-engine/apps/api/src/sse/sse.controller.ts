import { Controller, Sse, Param, UseGuards, Req, MessageEvent } from '@nestjs/common';
import { Observable, interval, map, merge } from 'rxjs';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { SseService } from './sse.service';
import { Request } from 'express';

@Controller('api/v1/sse')
@UseGuards(ApiKeyGuard)
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('dashboards/:dashboardId')
  stream(
    @Req() req: Request & { tenantId: string },
    @Param('dashboardId') dashboardId: string,
  ): Observable<MessageEvent> {
    const tenantId = req.tenantId;

    const connected$ = new Observable<MessageEvent>((subscriber) => {
      subscriber.next(
        new MessageEvent('message', {
          data: JSON.stringify({
            type: 'connected',
            dashboardId,
            timestamp: new Date().toISOString(),
          }),
        }),
      );
    });

    const heartbeat$ = interval(30000).pipe(
      map(
        () =>
          new MessageEvent('message', {
            data: JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
            }),
          }),
      ),
    );

    const updates$ = this.sseService.subscribe(tenantId, dashboardId);

    return merge(connected$, heartbeat$, updates$);
  }
}
