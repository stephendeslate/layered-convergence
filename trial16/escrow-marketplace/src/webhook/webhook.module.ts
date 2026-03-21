import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PayoutModule } from '../payout/payout.module';
import { StripeAccountModule } from '../stripe-account/stripe-account.module';

@Module({
  imports: [PayoutModule, StripeAccountModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
