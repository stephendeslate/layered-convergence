import { Module } from '@nestjs/common';
import { GpsService } from './gps.service';
import { GpsGateway } from './gps.gateway';
import { GpsController } from './gps.controller';
import { TechniciansModule } from '../technicians/technicians.module';

@Module({
  imports: [TechniciansModule],
  controllers: [GpsController],
  providers: [GpsService, GpsGateway],
  exports: [GpsService],
})
export class GpsModule {}
