import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StripeConnectService } from './stripe-connect.service';
import { CreateConnectedAccountDto } from './dto/create-connected-account.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('stripe-connect')
@UseGuards(AuthGuard)
export class StripeConnectController {
  constructor(private readonly stripeConnectService: StripeConnectService) {}

  @Post('accounts')
  createAccount(@Body() dto: CreateConnectedAccountDto) {
    return this.stripeConnectService.createConnectedAccount(dto.userId);
  }

  @Get('accounts')
  findAll() {
    return this.stripeConnectService.findAll();
  }

  @Get('accounts/:userId/onboarding-url')
  getOnboardingUrl(@Param('userId') userId: string) {
    return this.stripeConnectService.getOnboardingUrl(userId);
  }

  @Post('accounts/:userId/complete-onboarding')
  completeOnboarding(@Param('userId') userId: string) {
    return this.stripeConnectService.completeOnboarding(userId);
  }

  @Get('accounts/:userId/status')
  getAccountStatus(@Param('userId') userId: string) {
    return this.stripeConnectService.getAccountStatus(userId);
  }
}
