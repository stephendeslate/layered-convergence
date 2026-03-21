import { Module } from '@nestjs/common';
import { GpsService } from './gps.service';
import { GpsGateway } from './gps.gateway';
import { PrismaService } from '../../common/prisma.service';

@Module({
  providers: [GpsGateway, GpsService, PrismaService],
  exports: [GpsService],
})
export class GpsModule {}
