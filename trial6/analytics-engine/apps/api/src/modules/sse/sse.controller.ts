import { Controller, Sse, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('dashboards')
  subscribeToDashboard(
    @Query('tenantId') tenantId: string,
    @Query('dashboardId') dashboardId: string,
  ): Observable<MessageEvent> {
    return this.sseService.subscribe(tenantId, dashboardId);
  }
}
