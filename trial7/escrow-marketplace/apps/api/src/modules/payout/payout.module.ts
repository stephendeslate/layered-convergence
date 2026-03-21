import { Module } from '@nestjs/common';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [PayoutController],
  providers: [PayoutService, PrismaService],
  exports: [PayoutService],
})
export class PayoutModule {}
