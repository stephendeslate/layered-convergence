import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  process(
    @Body() body: { idempotencyKey: string; event: string; payload: any },
  ) {
    return this.webhookService.process(body);
  }

  @Get()
  findAll() {
    return this.webhookService.findAll();
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.webhookService.findByKey(key);
  }
}
