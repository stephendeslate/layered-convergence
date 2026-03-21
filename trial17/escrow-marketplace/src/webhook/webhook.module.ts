import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { PayoutModule } from '../payout/payout.module';
import { StripeAccountModule } from '../stripe-account/stripe-account.module';

@Module({
  imports: [PayoutModule, StripeAccountModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
