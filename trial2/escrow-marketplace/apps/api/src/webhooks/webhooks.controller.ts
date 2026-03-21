import {
  Controller,
  Post,
  Headers,
  RawBody,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { StripeService } from '../stripe/stripe.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private webhooksService: WebhooksService,
    private stripeService: StripeService,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!rawBody) {
      throw new BadRequestException('Missing request body');
    }

    let event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Invalid webhook signature');
    }

    await this.webhooksService.processEvent(event);

    return { received: true };
  }
}
