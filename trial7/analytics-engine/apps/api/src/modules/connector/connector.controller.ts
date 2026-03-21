import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { IngestWebhookDto } from './dto/ingest-webhook.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('connectors')
export class ConnectorController {
  constructor(private readonly connectorService: ConnectorService) {}

  /**
   * Webhook ingest endpoint — receives data events from external sources.
   * API key required for authentication.
   */
  @Post(':dataSourceId/ingest')
  @UseGuards(ApiKeyGuard)
  ingest(
    @Param('dataSourceId') dataSourceId: string,
    @Body() dto: IngestWebhookDto,
  ) {
    return this.connectorService.ingestWebhook(dataSourceId, dto);
  }

  /**
   * Trigger a manual sync for API or PostgreSQL connectors.
   */
  @Post(':dataSourceId/sync')
  @UseGuards(ApiKeyGuard)
  triggerSync(@Param('dataSourceId') dataSourceId: string) {
    return this.connectorService.triggerSync(dataSourceId);
  }
}
