// TRACED:AE-REQUEST-CONTEXT-SERVICE
import { Injectable, Scope } from '@nestjs/common';

/**
 * T41 Variation: Request-scoped provider that stores correlation ID,
 * user ID (if authenticated), and tenant ID for the current request.
 * GlobalExceptionFilter and request logging middleware read from this
 * service instead of parsing headers directly.
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private correlationId: string = '';
  private userId: string | null = null;
  private tenantId: string | null = null;

  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  getCorrelationId(): string {
    return this.correlationId;
  }

  setUserId(id: string | null): void {
    this.userId = id;
  }

  getUserId(): string | null {
    return this.userId;
  }

  setTenantId(id: string | null): void {
    this.tenantId = id;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }

  toLogContext(): Record<string, string | null> {
    return {
      correlationId: this.correlationId,
      userId: this.userId,
      tenantId: this.tenantId,
    };
  }
}
