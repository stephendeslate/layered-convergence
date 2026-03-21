import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  Headers,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { PrismaService } from '../../config/prisma.service';

@Controller('connectors')
export class ConnectorController {
  private readonly logger = new Logger(ConnectorController.name);

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':dataSourceId/sync')
  @UseGuards(ApiKeyGuard)
  sync(@Param('dataSourceId') dataSourceId: string) {
    return this.connectorService.executeSync(dataSourceId);
  }

  /**
   * Webhook ingest endpoint. Does NOT use ApiKeyGuard — authenticates
   * via the webhook secret in the x-webhook-secret header.
   */
  @Post(':dataSourceId/webhook')
  async ingestWebhook(
    @Param('dataSourceId') dataSourceId: string,
    @Headers('x-webhook-secret') secret: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
    });

    if (dataSource.type !== 'webhook') {
      throw new UnauthorizedException('Data source is not a webhook type');
    }

    if (dataSource.webhookSecret !== secret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    await this.connectorService.ingestWebhookEvent(dataSourceId, dataSource.tenantId, payload);
    this.logger.log(`Webhook event ingested for source ${dataSourceId}`);
    return { status: 'accepted' };
  }
}
