import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { UserRole } from '@prisma/client';

@Controller('analytics')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('transactions')
  getTransactionSummary(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getTransactionSummary(user.tenantId);
  }

  @Get('disputes')
  getDisputeMetrics(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getDisputeMetrics(user.tenantId);
  }

  @Get('revenue')
  getRevenueBreakdown(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getRevenueBreakdown(user.tenantId);
  }
}
