import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('connectors')
export class ConnectorController {
  constructor(private readonly connectorService: ConnectorService) {}

  @Post(':dataSourceId/sync')
  @UseGuards(ApiKeyGuard)
  executeSync(@Param('dataSourceId') dataSourceId: string) {
    return this.connectorService.executeSync(dataSourceId);
  }

  /** Public webhook ingest endpoint — validated by dataSourceId. */
  @Post('ingest/:dataSourceId')
  ingestWebhook(
    @Param('dataSourceId') dataSourceId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.connectorService.ingestWebhookEvent(dataSourceId, payload);
  }
}
