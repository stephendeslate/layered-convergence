import { Module } from '@nestjs/common';
import { GpsTrackingService } from './gps-tracking.service';
import { GpsTrackingController } from './gps-tracking.controller';
import { GpsTrackingGateway } from './gps-tracking.gateway';

@Module({
  controllers: [GpsTrackingController],
  providers: [GpsTrackingService, GpsTrackingGateway],
  exports: [GpsTrackingService],
})
export class GpsTrackingModule {}
