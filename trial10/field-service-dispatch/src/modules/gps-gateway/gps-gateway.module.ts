import { Module } from '@nestjs/common';
import { GpsGateway } from './gps-gateway.gateway';

@Module({
  providers: [GpsGateway],
  exports: [GpsGateway],
})
export class GpsGatewayModule {}
