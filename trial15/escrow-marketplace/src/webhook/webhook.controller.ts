import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WebhookService, StripeWebhookPayload } from './webhook.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  async handleStripeWebhook(@Body() payload: StripeWebhookPayload) {
    return this.webhookService.processWebhook(payload);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.webhookService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.webhookService.findOne(id);
  }
}
