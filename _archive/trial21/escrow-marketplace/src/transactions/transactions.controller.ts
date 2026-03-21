import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, TransitionTransactionDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('transactions')
@UseGuards(RolesGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @Roles(UserRole.BUYER)
  create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.transactionsService.create(userId, tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.transactionsService.findAll(tenantId);
  }

  @Get('analytics')
  @Roles(UserRole.ADMIN)
  getAnalytics(@CurrentUser('tenantId') tenantId: string) {
    return this.transactionsService.getAnalytics(tenantId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.transactionsService.findOne(id, tenantId);
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionTransactionDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.transactionsService.transition(id, tenantId, dto, userId);
  }

  @Get('buyer/:buyerId')
  findByBuyer(
    @Param('buyerId') buyerId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.transactionsService.findByBuyer(buyerId, tenantId);
  }

  @Get('provider/:providerId')
  findByProvider(
    @Param('providerId') providerId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.transactionsService.findByProvider(providerId, tenantId);
  }
}
