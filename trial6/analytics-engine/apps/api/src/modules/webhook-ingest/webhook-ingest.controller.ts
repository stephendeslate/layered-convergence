import { Controller, Post, Body, Param } from '@nestjs/common';
import { WebhookIngestService } from './webhook-ingest.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';

@Controller('ingest')
export class WebhookIngestController {
  constructor(private readonly webhookIngestService: WebhookIngestService) {}

  @Post(':dataSourceId')
  ingest(
    @Param('dataSourceId') dataSourceId: string,
    @Body() dto: WebhookPayloadDto,
  ) {
    return this.webhookIngestService.ingest(dataSourceId, dto);
  }
}
