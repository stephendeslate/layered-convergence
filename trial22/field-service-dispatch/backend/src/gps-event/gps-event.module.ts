import { Module } from '@nestjs/common';
import { GpsEventController } from './gps-event.controller';
import { GpsEventService } from './gps-event.service';

@Module({
  controllers: [GpsEventController],
  providers: [GpsEventService],
  exports: [GpsEventService],
})
export class GpsEventModule {}
