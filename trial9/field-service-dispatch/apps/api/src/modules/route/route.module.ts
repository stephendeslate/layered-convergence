import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [RouteController],
  providers: [RouteService, PrismaService],
  exports: [RouteService],
})
export class RouteModule {}
