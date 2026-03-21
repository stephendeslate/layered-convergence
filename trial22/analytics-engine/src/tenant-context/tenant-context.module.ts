// [TRACED:SA-006] Tenant context module for multi-tenant isolation

import { Module } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';

@Module({
  providers: [TenantContextMiddleware],
  exports: [TenantContextMiddleware],
})
export class TenantContextModule {}
