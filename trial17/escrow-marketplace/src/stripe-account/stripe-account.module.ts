import { Module } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service';
import { StripeAccountController } from './stripe-account.controller';

@Module({
  providers: [StripeAccountService],
  controllers: [StripeAccountController],
  exports: [StripeAccountService],
})
export class StripeAccountModule {}
