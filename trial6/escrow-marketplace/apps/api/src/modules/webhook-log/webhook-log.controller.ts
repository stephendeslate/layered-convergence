import { Controller, Get, Param, Query } from '@nestjs/common';
import { WebhookLogService } from './webhook-log.service';
import { WebhookLogQueryDto } from './dto/webhook-log-query.dto';

@Controller('admin/webhook-logs')
export class WebhookLogController {
  constructor(private readonly webhookLogService: WebhookLogService) {}

  @Get()
  findAll(@Query() query: WebhookLogQueryDto) {
    return this.webhookLogService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webhookLogService.findOne(id);
  }
}
