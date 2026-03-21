import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('webhooks')
@UseGuards(AuthGuard, RolesGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Post('stripe')
  handleStripeWebhook(@Body() dto: WebhookEventDto) {
    return this.webhooksService.processEvent(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('limit') limit?: string) {
    return this.webhooksService.findAll(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('by-type')
  @Roles(UserRole.ADMIN)
  findByType(@Query('eventType') eventType: string) {
    return this.webhooksService.findByEventType(eventType);
  }
}
