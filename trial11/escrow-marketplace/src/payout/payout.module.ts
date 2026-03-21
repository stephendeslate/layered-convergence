import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service.js';
import { PayoutController } from './payout.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PayoutController],
  providers: [PayoutService],
  exports: [PayoutService],
})
export class PayoutModule {}
