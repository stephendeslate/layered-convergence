import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { StripeAccountService } from './stripe-account.service';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('stripe-accounts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StripeAccountController {
  constructor(private readonly stripeAccountService: StripeAccountService) {}

  @Post()
  @Roles(Role.SELLER, Role.ADMIN)
  async create(
    @Body() dto: CreateStripeAccountDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.stripeAccountService.create(user.sub, dto.stripeAccountId);
  }

  @Get('me')
  async findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.stripeAccountService.findByUserId(user.sub);
  }
}
