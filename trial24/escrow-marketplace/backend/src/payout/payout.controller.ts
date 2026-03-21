import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PayoutStatus } from '@prisma/client';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: string; email: string; role: string };
}

// [TRACED:AC-006] Payout endpoints for CRUD and status transitions
@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreatePayoutDto) {
    return this.payoutService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.payoutService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.payoutService.findOne(req.user.userId, id);
  }

  @Patch(':id/process')
  async process(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.payoutService.updateStatus(req.user.userId, id, PayoutStatus.PROCESSING);
  }

  @Patch(':id/complete')
  async complete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.payoutService.updateStatus(req.user.userId, id, PayoutStatus.COMPLETED);
  }
}
