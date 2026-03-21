import { Module } from '@nestjs/common';
import { StripeConnectService } from './stripe-connect.service';
import { StripeConnectController } from './stripe-connect.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [StripeConnectController],
  providers: [StripeConnectService, PrismaService],
  exports: [StripeConnectService],
})
export class StripeConnectModule {}
