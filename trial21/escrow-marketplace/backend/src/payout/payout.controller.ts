import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Controller('payouts')
@UseGuards(AuthGuard('jwt'))
export class PayoutController {
  constructor(private payoutService: PayoutService) {}

  @Post()
  create(@Request() req: { user: { id: string; role: string } }, @Body() dto: CreatePayoutDto) {
    return this.payoutService.create(req.user.id, req.user.role, dto);
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.payoutService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.payoutService.findOne(req.user.id, id);
  }
}
