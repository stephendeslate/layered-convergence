import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Post('stripe')
  handleStripeWebhook(@Body() body: any) {
    return this.webhooksService.processEvent({
      id: body.id,
      type: body.type,
      data: body.data?.object || body.data || {},
    });
  }

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.webhooksService.findAll(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('by-type')
  findByType(@Query('type') type: string) {
    return this.webhooksService.findByEventType(type);
  }
}
