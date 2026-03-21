import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';
import { UpdateStripeAccountDto } from './dto/update-stripe-account.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

@Controller('stripe-accounts')
@UseGuards(AuthGuard)
export class StripeAccountController {
  constructor(private readonly stripeAccountService: StripeAccountService) {}

  @Post()
  async create(@Body() dto: CreateStripeAccountDto, @CurrentUser() user: JwtPayload) {
    return this.stripeAccountService.create(dto, user);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @CurrentUser() user: JwtPayload) {
    return this.stripeAccountService.findByUser(userId, user);
  }

  @Get('stripe/:stripeAccountId')
  async findByStripeId(@Param('stripeAccountId') stripeAccountId: string) {
    return this.stripeAccountService.findByStripeId(stripeAccountId);
  }

  @Patch('user/:userId')
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateStripeAccountDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stripeAccountService.update(userId, dto, user);
  }

  @Delete('user/:userId')
  async delete(@Param('userId') userId: string, @CurrentUser() user: JwtPayload) {
    return this.stripeAccountService.delete(userId, user);
  }
}
