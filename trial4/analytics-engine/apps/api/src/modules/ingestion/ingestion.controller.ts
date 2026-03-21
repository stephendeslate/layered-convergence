import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestWebhookDto } from './ingestion.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('webhook/:dataSourceId')
  async ingestWebhook(
    @Headers('x-tenant-id') tenantId: string,
    @Param('dataSourceId') dataSourceId: string,
    @Body() dto: IngestWebhookDto,
  ) {
    return this.ingestionService.ingestWebhook(tenantId, dataSourceId, dto);
  }

  @Post('dead-letters/:id/retry')
  async retryDeadLetter(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ingestionService.retryDeadLetter(tenantId, id);
  }

  @Get('dead-letters/:dataSourceId')
  async getDeadLetters(
    @Headers('x-tenant-id') tenantId: string,
    @Param('dataSourceId') dataSourceId: string,
  ) {
    return this.ingestionService.getDeadLetters(tenantId, dataSourceId);
  }
}
