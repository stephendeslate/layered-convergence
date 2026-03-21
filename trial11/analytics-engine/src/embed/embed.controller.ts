import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { EmbedService } from './embed.service.js';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto.js';

@Controller()
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post('embed-configs')
  createEmbedConfig(@Body() dto: CreateEmbedConfigDto) {
    return this.embedService.createEmbedConfig(dto);
  }

  @Get('embed/:dashboardId')
  getEmbeddedDashboard(
    @Param('dashboardId') dashboardId: string,
    @Query('apiKey') apiKey: string,
  ) {
    return this.embedService.getEmbeddedDashboard(dashboardId, apiKey);
  }
}
