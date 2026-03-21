import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService } from './sse.service.js';
export declare class SseController {
    private readonly sseService;
    constructor(sseService: SseService);
    dashboardUpdates(dashboardId: string): Observable<MessageEvent>;
}
