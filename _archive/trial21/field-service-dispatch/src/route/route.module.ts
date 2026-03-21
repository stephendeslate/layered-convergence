import { Module } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { RouteController } from './route.controller.js';

@Module({
  controllers: [RouteController],
  providers: [RouteService],
  exports: [RouteService],
})
export class RouteModule {}
