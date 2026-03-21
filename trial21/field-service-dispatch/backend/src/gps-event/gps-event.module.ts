import { Module } from '@nestjs/common';
import { GpsEventService } from './gps-event.service';
import { GpsEventController } from './gps-event.controller';
import { CompanyContextModule } from '../company-context/company-context.module';

@Module({
  imports: [CompanyContextModule],
  providers: [GpsEventService],
  controllers: [GpsEventController],
  exports: [GpsEventService],
})
export class GpsEventModule {}
