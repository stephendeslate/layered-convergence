import { Module } from '@nestjs/common';
import { WebhookLogController } from './webhook-log.controller';
import { WebhookLogService } from './webhook-log.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [WebhookLogController],
  providers: [WebhookLogService, PrismaService],
  exports: [WebhookLogService],
})
export class WebhookLogModule {}
