import { Module } from '@nestjs/common';
import { WebhookLogService } from './webhook-log.service';
import { WebhookLogController } from './webhook-log.controller';

@Module({
  controllers: [WebhookLogController],
  providers: [WebhookLogService],
  exports: [WebhookLogService],
})
export class WebhookLogModule {}
