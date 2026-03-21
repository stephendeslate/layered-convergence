import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateConnectedAccountDto } from './stripe.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('connect')
  async createConnectedAccount(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateConnectedAccountDto,
  ) {
    return this.stripeService.createConnectedAccount(userId, dto);
  }

  @Get('onboarding-status')
  async getOnboardingStatus(@Headers('x-user-id') userId: string) {
    return this.stripeService.getOnboardingStatus(userId);
  }
}
