import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';

@Module({})
export class TenantContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .exclude(
        'auth/(.*)',
        'tracking/(.*)',
        'health(.*)',
      )
      .forRoutes('*');
  }
}
