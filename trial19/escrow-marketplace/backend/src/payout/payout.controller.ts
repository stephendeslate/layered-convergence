import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces';

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePayoutDto) {
    return this.payoutService.create(req.user.id, req.user.role, dto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.payoutService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.payoutService.findById(id, req.user.id, req.user.role);
  }
}
