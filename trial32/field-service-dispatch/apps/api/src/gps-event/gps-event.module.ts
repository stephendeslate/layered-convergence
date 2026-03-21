import { Module } from '@nestjs/common';
import { GpsEventService } from './gps-event.service';
import { GpsEventController } from './gps-event.controller';

@Module({
  providers: [GpsEventService],
  controllers: [GpsEventController],
})
export class GpsEventModule {}
