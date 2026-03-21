import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PayoutStatus, UserRole } from '@prisma/client';

@Controller('payouts')
@UseGuards(AuthGuard, RolesGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreatePayoutDto, @CurrentUser() user: RequestUser) {
    return this.payoutsService.create(dto, user.sub);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    if (user.role === UserRole.PROVIDER) {
      return this.payoutsService.findAll(user.sub);
    }
    return this.payoutsService.findAll();
  }

  @Get('summary')
  @Roles(UserRole.PROVIDER)
  getSummary(@CurrentUser() user: RequestUser) {
    return this.payoutsService.getProviderPayoutSummary(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutsService.findById(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: PayoutStatus) {
    return this.payoutsService.updateStatus(id, status);
  }
}
