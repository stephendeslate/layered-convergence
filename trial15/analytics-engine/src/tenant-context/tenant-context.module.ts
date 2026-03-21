import { Module } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [TenantContextMiddleware],
  exports: [TenantContextMiddleware],
})
export class TenantContextModule {}
