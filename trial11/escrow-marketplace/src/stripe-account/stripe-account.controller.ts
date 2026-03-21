import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service.js';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto.js';
import { UpdateOnboardingStatusDto } from './dto/update-onboarding-status.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../../generated/prisma/client.js';

@Controller('stripe-accounts')
@UseGuards(AuthGuard)
export class StripeAccountController {
  constructor(private readonly stripeAccountService: StripeAccountService) {}

  @Post()
  async create(@Body() dto: CreateStripeAccountDto, @CurrentUser() user: User) {
    return this.stripeAccountService.createAccount(user.id, dto.stripeAccountId);
  }

  @Get('me')
  async getMyAccount(@CurrentUser() user: User) {
    return this.stripeAccountService.getMyAccount(user.id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOnboardingStatusDto,
  ) {
    return this.stripeAccountService.updateOnboardingStatus(id, dto.onboardingStatus);
  }
}
