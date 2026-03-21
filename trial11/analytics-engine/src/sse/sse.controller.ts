import { Controller, Param, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { SseService } from './sse.service.js';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('dashboards/:dashboardId')
  streamDashboardUpdates(
    @Param('dashboardId') dashboardId: string,
  ): Observable<{ data: string; retry: number }> {
    return this.sseService.subscribe(dashboardId).pipe(
      map((event) => ({
        data: event.data,
        // Convention 5.25: SSE endpoints include retry field
        retry: 10000,
      })),
    );
  }
}
