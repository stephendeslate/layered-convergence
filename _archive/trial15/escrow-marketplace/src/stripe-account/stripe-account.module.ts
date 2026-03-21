import { Module } from '@nestjs/common';
import { StripeAccountController } from './stripe-account.controller.js';
import { StripeAccountService } from './stripe-account.service.js';

@Module({
  controllers: [StripeAccountController],
  providers: [StripeAccountService],
})
export class StripeAccountModule {}
