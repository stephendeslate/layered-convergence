import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeConnectService } from './stripe-connect.service';
import { StripeConnectController } from './stripe-connect.controller';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [StripeConnectController],
  providers: [StripeService, StripeConnectService],
  exports: [StripeService, StripeConnectService],
})
export class StripeModule {}
