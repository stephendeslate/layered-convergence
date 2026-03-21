import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';

@Module({
  providers: [TenantContextMiddleware],
  exports: [TenantContextMiddleware],
})
export class TenantContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .exclude(
        { path: 'api/auth/(.*)', method: RequestMethod.ALL },
        { path: 'api/embed/(.*)', method: RequestMethod.ALL },
        { path: 'api/embed-data/(.*)', method: RequestMethod.ALL },
        { path: 'api/webhooks/(.*)', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
