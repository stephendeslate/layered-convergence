import { Module } from '@nestjs/common';
import { GpsGatewayService } from './gps-gateway.service';
import { GpsGateway } from './gps-gateway.gateway';

@Module({
  providers: [GpsGatewayService, GpsGateway],
  exports: [GpsGatewayService],
})
export class GpsGatewayModule {}
