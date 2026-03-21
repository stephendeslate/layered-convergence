import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { AnalyticsQueryDto, ProviderLeaderboardQueryDto } from './dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles('ADMIN', 'PROVIDER')
  async getOverview(@CurrentUser() user: CurrentUserData) {
    const providerId = user.role === 'PROVIDER' ? user.id : undefined;
    return this.analyticsService.getOverviewMetrics(providerId);
  }

  @Get('volume')
  @Roles('ADMIN')
  async getVolume(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTransactionVolume(
      { from: new Date(query.from), to: new Date(query.to) },
      query.groupBy || 'day',
    );
  }

  @Get('fees')
  @Roles('ADMIN')
  async getFees(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getPlatformFees({
      from: new Date(query.from),
      to: new Date(query.to),
    });
  }

  @Get('disputes')
  @Roles('ADMIN')
  async getDisputeRate(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDisputeRate({
      from: new Date(query.from),
      to: new Date(query.to),
    });
  }

  @Get('hold-time')
  @Roles('ADMIN')
  async getHoldTime(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getAverageHoldTime({
      from: new Date(query.from),
      to: new Date(query.to),
    });
  }

  @Get('providers/leaderboard')
  @Roles('ADMIN')
  async getProviderLeaderboard(@Query() query: ProviderLeaderboardQueryDto) {
    return this.analyticsService.getProviderLeaderboard(query.limit);
  }
}
