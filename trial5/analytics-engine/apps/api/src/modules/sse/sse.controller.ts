import { Controller, Get, Param, Sse, MessageEvent } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse(':dashboardId')
  stream(@Param('dashboardId') dashboardId: string): Observable<MessageEvent> {
    return this.sseService.getStream(dashboardId).pipe(
      map((event) => ({
        data: JSON.stringify({ type: event.type, data: event.data }),
        type: event.type,
      })),
    );
  }
}
