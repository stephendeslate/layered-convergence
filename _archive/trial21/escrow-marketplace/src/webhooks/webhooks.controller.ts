import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookEventDto } from './dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Public()
  @Post('stripe')
  processStripeEvent(@Body() dto: WebhookEventDto) {
    return this.webhooksService.processEvent(dto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId?: string) {
    return this.webhooksService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webhooksService.findOne(id);
  }

  @Get('type/:eventType')
  findByEventType(@Param('eventType') eventType: string) {
    return this.webhooksService.findByEventType(eventType);
  }
}
