import { Module } from '@nestjs/common';
import { GpsService } from './gps.service';
import { GpsGateway } from './gps.gateway';
import { GpsController } from './gps.controller';

@Module({
  controllers: [GpsController],
  providers: [GpsService, GpsGateway],
  exports: [GpsService],
})
export class GpsModule {}
