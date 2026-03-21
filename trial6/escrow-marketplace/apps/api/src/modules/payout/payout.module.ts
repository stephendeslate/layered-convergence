import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [PayoutController],
  providers: [PayoutService, PrismaService],
  exports: [PayoutService],
})
export class PayoutModule {}
