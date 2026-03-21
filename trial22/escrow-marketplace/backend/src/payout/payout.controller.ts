import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: string; email: string; role: string };
}

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.payoutService.findAllForUser(req.user.userId);
  }
}
