import { Controller, Post, Body, Param } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestWebhookDto } from './dto/ingest-webhook.dto';

@Controller('ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('webhook/:dataSourceId')
  ingestWebhook(
    @Param('dataSourceId') dataSourceId: string,
    @Body() dto: IngestWebhookDto,
  ) {
    return this.ingestionService.ingestWebhook(dataSourceId, dto);
  }

  @Post('batch/:dataSourceId')
  ingestBatch(
    @Param('dataSourceId') dataSourceId: string,
    @Body() events: IngestWebhookDto[],
  ) {
    return this.ingestionService.ingestBatch(dataSourceId, events);
  }
}
