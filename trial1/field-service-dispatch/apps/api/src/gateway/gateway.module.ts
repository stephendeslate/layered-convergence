import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GpsGateway } from './gps.gateway';
import { GpsHistoryService } from './gps-history.service';
import { GpsHistoryController } from './gps-history.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
    }),
  ],
  controllers: [GpsHistoryController],
  providers: [GpsGateway, GpsHistoryService],
  exports: [GpsGateway, GpsHistoryService],
})
export class GatewayModule {}
