// TRACED:EM-MON-02 RequestContextService — request-scoped provider (T41 variation)
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private correlationId: string;
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

  toLogContext(): Record<string, unknown> {
    return {
      correlationId: this.correlationId,
      userId: this.userId,
      tenantId: this.tenantId,
    };
  }
}
