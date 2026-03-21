import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('stripe-accounts')
@UseGuards(AuthGuard)
export class StripeAccountController {
  constructor(private readonly stripeAccountService: StripeAccountService) {}

  @Post()
  @Roles('PROVIDER')
  create(@CurrentUser() user: any, @Body() dto: CreateStripeAccountDto) {
    return this.stripeAccountService.create(user.id, dto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.stripeAccountService.findAll();
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.stripeAccountService.findByUser(userId);
  }

  @Patch(':userId/complete-onboarding')
  @Roles('ADMIN')
  completeOnboarding(@Param('userId') userId: string) {
    return this.stripeAccountService.completeOnboarding(userId);
  }
}
