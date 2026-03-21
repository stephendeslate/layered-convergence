import { Module } from '@nestjs/common';
import { GpsGateway } from './gps.gateway.js';

@Module({
  providers: [GpsGateway],
  exports: [GpsGateway],
})
export class GpsModule {}
