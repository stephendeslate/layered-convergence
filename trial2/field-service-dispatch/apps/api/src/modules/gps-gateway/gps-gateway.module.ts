import { Module } from '@nestjs/common';
import { GpsGatewayGateway } from './gps-gateway.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [GpsGatewayGateway],
  exports: [GpsGatewayGateway],
})
export class GpsGatewayModule {}
