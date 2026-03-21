import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { TenantContextModule } from '../tenant/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
