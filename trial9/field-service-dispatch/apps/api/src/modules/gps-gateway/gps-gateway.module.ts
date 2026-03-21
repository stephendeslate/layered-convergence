import { Module } from '@nestjs/common';
import { GpsGateway } from './gps.gateway';
import { TechnicianModule } from '../technician/technician.module';

@Module({
  imports: [TechnicianModule],
  providers: [GpsGateway],
  exports: [GpsGateway],
})
export class GpsGatewayModule {}
