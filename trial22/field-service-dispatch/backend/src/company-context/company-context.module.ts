import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CompanyContextMiddleware } from './company-context.middleware';

@Module({})
export class CompanyContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CompanyContextMiddleware).forRoutes('*');
  }
}
