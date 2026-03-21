import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StripeAccountService } from './stripe-account.service';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('stripe-accounts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StripeAccountController {
  constructor(private readonly stripeAccountService: StripeAccountService) {}

  @Post()
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
