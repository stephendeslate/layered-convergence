import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces';

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.payoutService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.payoutService.findById(id, req.user.userId, req.user.role);
  }
}
