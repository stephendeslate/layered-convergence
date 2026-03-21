import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StripeConnectService } from './stripe-connect.service';
import { OnboardingDto } from './dto/onboarding.dto';

@Controller('stripe-connect')
export class StripeConnectController {
  constructor(private readonly stripeConnectService: StripeConnectService) {}

  @Post('onboarding')
  initiateOnboarding(@Body() dto: OnboardingDto) {
    return this.stripeConnectService.initiateOnboarding(dto);
  }

  @Post('onboarding/:stripeAccountId/complete')
  completeOnboarding(@Param('stripeAccountId') stripeAccountId: string) {
    return this.stripeConnectService.completeOnboarding(stripeAccountId);
  }

  @Get('account/:userId')
  getAccountByUser(@Param('userId') userId: string) {
    return this.stripeConnectService.getAccountByUser(userId);
  }
}
