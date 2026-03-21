import { Module, forwardRef } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookHandlersService } from './webhook-handlers.service';
import { TransactionModule } from '../transaction/transaction.module';
import { DisputeModule } from '../dispute/dispute.module';
import { ProviderModule } from '../provider/provider.module';
import { PayoutModule } from '../payout/payout.module';

@Module({
  imports: [
    TransactionModule,
    forwardRef(() => DisputeModule),
    ProviderModule,
    PayoutModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookHandlersService],
  exports: [WebhookService],
})
export class WebhookModule {}
