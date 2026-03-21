import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { CompanyContextModule } from '../company-context/company-context.module';

@Module({
  imports: [CompanyContextModule],
  providers: [RouteService],
  controllers: [RouteController],
  exports: [RouteService],
})
export class RouteModule {}
