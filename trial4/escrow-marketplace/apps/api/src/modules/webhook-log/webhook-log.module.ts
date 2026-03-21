import { Module } from '@nestjs/common';
import { WebhookLogService } from './webhook-log.service';
import { WebhookLogController } from './webhook-log.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WebhookLogController],
  providers: [WebhookLogService],
  exports: [WebhookLogService],
})
export class WebhookLogModule {}
