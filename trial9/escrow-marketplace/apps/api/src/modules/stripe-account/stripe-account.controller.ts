import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';

@Controller('stripe-accounts')
@UseGuards(AuthGuard)
export class StripeAccountController {
  constructor(private readonly stripeAccountService: StripeAccountService) {}

  @Post('onboard')
  initiateOnboarding(@CurrentUserId() userId: string) {
    return this.stripeAccountService.initiateOnboarding(userId);
  }

  @Get('me')
  findMyAccount(@CurrentUserId() userId: string) {
    return this.stripeAccountService.findByUserId(userId);
  }

  @Post(':stripeAccountId/complete')
  completeOnboarding(@Param('stripeAccountId') stripeAccountId: string) {
    return this.stripeAccountService.completeOnboarding(stripeAccountId);
  }
}
