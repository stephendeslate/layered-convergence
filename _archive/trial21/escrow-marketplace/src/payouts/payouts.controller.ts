import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('payouts')
@UseGuards(RolesGuard)
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreatePayoutDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.payoutsService.create(userId, tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.payoutsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.payoutsService.findOne(id, tenantId);
  }

  @Get('user/:userId')
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  findByUser(
    @Param('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.payoutsService.findByUser(userId, tenantId);
  }
}
