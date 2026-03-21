import { Controller, Get, Post, Param, Body, Headers, UseGuards } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('embed')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post('config')
  @UseGuards(ApiKeyGuard)
  createOrUpdateConfig(@Body() dto: CreateEmbedConfigDto) {
    return this.embedService.createOrUpdate(dto);
  }

  @Get('config/:dashboardId')
  @UseGuards(ApiKeyGuard)
  getConfig(@Param('dashboardId') dashboardId: string) {
    return this.embedService.findByDashboard(dashboardId);
  }

  /**
   * Public endpoint — renders embed data for a published dashboard.
   * No API key required; origin validation serves as the access control.
   */
  @Get(':dashboardId')
  getEmbedData(
    @Param('dashboardId') dashboardId: string,
    @Headers('origin') origin?: string,
  ) {
    return this.embedService.getEmbedData(dashboardId, origin);
  }
}
