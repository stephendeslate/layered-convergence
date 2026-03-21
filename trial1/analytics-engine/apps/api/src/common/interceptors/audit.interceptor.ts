import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../audit/audit.service';

/**
 * Interceptor that logs all mutation operations (POST, PUT, PATCH, DELETE)
 * to the AuditLog table for compliance and debugging.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only log mutations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const tenantId = request.user?.tenantId;
          if (!tenantId) return;

          // Fire and forget — audit logging should not block the response
          this.auditService
            .logFromRequest(request, context)
            .catch(() => {
              // Silently ignore audit failures to avoid breaking the request
            });
        },
      }),
    );
  }
}
