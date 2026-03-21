import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WebhookLogService } from './webhook-log.service';
import { ProcessWebhookDto } from './webhook-log.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('webhooks')
export class WebhookLogController {
  constructor(private readonly webhookLogService: WebhookLogService) {}

  @Post()
  async processWebhook(@Body() dto: ProcessWebhookDto) {
    return this.webhookLogService.processWebhook(dto);
  }

  @Get()
  async findAll(@Query('limit') limit?: string) {
    return this.webhookLogService.findAll(limit ? parseInt(limit, 10) : 50);
  }
}
