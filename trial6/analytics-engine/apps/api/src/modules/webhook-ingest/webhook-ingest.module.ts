import { Module } from '@nestjs/common';
import { WebhookIngestService } from './webhook-ingest.service';
import { WebhookIngestController } from './webhook-ingest.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [WebhookIngestController],
  providers: [WebhookIngestService, PrismaService],
  exports: [WebhookIngestService],
})
export class WebhookIngestModule {}
