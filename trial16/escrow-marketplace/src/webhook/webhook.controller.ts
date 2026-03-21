import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = JSON.stringify(req.body);
    const event = this.webhookService.verifyWebhookSignature(rawBody, signature);
    return this.webhookService.handleEvent(event);
  }
}
