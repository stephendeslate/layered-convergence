import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { WebhookIngestDto } from './dto/webhook-ingest.dto';

@Controller('ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('webhook/:dataSourceId')
  ingestWebhook(
    @Param('dataSourceId') dataSourceId: string,
    @Body() dto: WebhookIngestDto,
  ) {
    return this.ingestionService.ingestWebhook(dataSourceId, dto);
  }

  @Get('dead-letter/:dataSourceId')
  getDeadLetterEvents(@Param('dataSourceId') dataSourceId: string) {
    return this.ingestionService.getDeadLetterEvents(dataSourceId);
  }

  @Post('dead-letter/:id/retry')
  retryDeadLetter(@Param('id') id: string) {
    return this.ingestionService.retryDeadLetter(id);
  }
}
