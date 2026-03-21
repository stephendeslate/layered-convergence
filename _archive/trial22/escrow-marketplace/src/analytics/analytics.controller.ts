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

  @Get('volume')
  getVolume(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getTransactionVolume(user.tenantId);
  }

  @Get('fees')
  getFees(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getPlatformFees(user.tenantId);
  }

  @Get('disputes')
  getDisputeRate(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getDisputeRate(user.tenantId);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getDashboard(user.tenantId);
  }
}
