import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get('transaction/:transactionId')
  async findByTransaction(@Param('transactionId') transactionId: string) {
    return this.webhookService.findByTransaction(transactionId);
  }
}
