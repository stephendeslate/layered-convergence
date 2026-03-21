import { Module } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';

@Module({
  providers: [TenantContextMiddleware],
  exports: [TenantContextMiddleware],
})
export class TenantContextModule {}
