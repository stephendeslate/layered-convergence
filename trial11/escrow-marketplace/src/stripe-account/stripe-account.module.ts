import { Module } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service.js';
import { StripeAccountController } from './stripe-account.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [StripeAccountController],
  providers: [StripeAccountService],
  exports: [StripeAccountService],
})
export class StripeAccountModule {}
