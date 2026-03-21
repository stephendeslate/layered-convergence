import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(
    @Body() dto: CreateWebhookDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.webhookService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.webhookService.findAll(req.user.userId);
  }
}
