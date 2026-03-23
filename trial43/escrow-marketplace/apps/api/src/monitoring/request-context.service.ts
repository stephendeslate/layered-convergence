// TRACED: EM-RCTX-001
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private _correlationId: string = '';
  private _userId: string | undefined;
  private _tenantId: string | undefined;

  get correlationId(): string {
    return this._correlationId;
  }
  set correlationId(value: string) {
    this._correlationId = value;
  }

  get userId(): string | undefined {
    return this._userId;
  }
  set userId(value: string | undefined) {
    this._userId = value;
  }

  get tenantId(): string | undefined {
    return this._tenantId;
  }
  set tenantId(value: string | undefined) {
    this._tenantId = value;
  }
}
