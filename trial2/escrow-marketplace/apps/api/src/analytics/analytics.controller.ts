import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@repo/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@Query('period') period?: string) {
    return this.analyticsService.getOverview(period);
  }

  @Get('volume')
  getVolume(@Query('period') period?: string) {
    return this.analyticsService.getVolume(period);
  }

  @Get('providers')
  getProviders() {
    return this.analyticsService.getProviders();
  }
}
