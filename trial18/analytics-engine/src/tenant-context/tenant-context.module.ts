import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TenantContextMiddleware } from './tenant-context.middleware';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [TenantContextMiddleware],
  exports: [TenantContextMiddleware, JwtModule],
})
export class TenantContextModule {}
