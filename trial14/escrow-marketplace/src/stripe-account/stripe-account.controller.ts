import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service.js';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';

@Controller('stripe-accounts')
@UseGuards(AuthGuard)
export class StripeAccountController {
  constructor(private readonly stripeAccountService: StripeAccountService) {}

  @Post()
  create(@Body() dto: CreateStripeAccountDto) {
    return this.stripeAccountService.create(dto);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.stripeAccountService.findByUserId(userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.stripeAccountService.updateStatus(id, dto.onboardingStatus);
  }
}
