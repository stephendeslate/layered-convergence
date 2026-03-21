import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { StripeConnectService } from './stripe-connect.service';
import { OnboardProviderDto } from './dto/onboard-provider.dto';

@Controller('stripe-connect')
export class StripeConnectController {
  constructor(private readonly stripeConnectService: StripeConnectService) {}

  @Post('onboard')
  onboardProvider(@Body() dto: OnboardProviderDto) {
    return this.stripeConnectService.onboardProvider(dto);
  }

  @Post(':userId/complete')
  completeOnboarding(@Param('userId') userId: string) {
    return this.stripeConnectService.completeOnboarding(userId);
  }

  @Get(':userId/status')
  getAccountStatus(@Param('userId') userId: string) {
    return this.stripeConnectService.getAccountStatus(userId);
  }

  @Post(':userId/refresh-link')
  refreshOnboardingLink(@Param('userId') userId: string) {
    return this.stripeConnectService.refreshOnboardingLink(userId);
  }
}
