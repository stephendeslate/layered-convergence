import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class SseService {
    private readonly subjects;
    getDashboardStream(dashboardId: string): Observable<MessageEvent>;
    emit(dashboardId: string, data: Record<string, any>): void;
    removeStream(dashboardId: string): void;
}
