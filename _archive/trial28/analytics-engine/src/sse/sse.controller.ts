import { Controller, Sse, Param, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService } from './sse.service.js';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('dashboards/:dashboardId')
  dashboardUpdates(
    @Param('dashboardId') dashboardId: string,
  ): Observable<MessageEvent> {
    return this.sseService.getDashboardStream(dashboardId);
  }
}
