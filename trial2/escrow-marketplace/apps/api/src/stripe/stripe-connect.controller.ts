import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@repo/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StripeConnectService } from './stripe-connect.service';

interface RequestWithUser {
  user: { sub: string; email: string; role: string };
}

@Controller('stripe/connect')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
export class StripeConnectController {
  constructor(private stripeConnectService: StripeConnectService) {}

  @Post('onboard')
  initiateOnboarding(@Request() req: RequestWithUser) {
    return this.stripeConnectService.initiateOnboarding(req.user.sub);
  }

  @Post('refresh')
  refreshOnboardingLink(@Request() req: RequestWithUser) {
    return this.stripeConnectService.refreshOnboardingLink(req.user.sub);
  }

  @Get('status')
  checkStatus(@Request() req: RequestWithUser) {
    return this.stripeConnectService.checkAccountStatus(req.user.sub);
  }
}
