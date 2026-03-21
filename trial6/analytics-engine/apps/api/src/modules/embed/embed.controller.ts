import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { EmbedConfigDto } from './dto/embed-config.dto';

@Controller('embed')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  createConfig(@Body() dto: EmbedConfigDto) {
    return this.embedService.createEmbedConfig(dto);
  }

  @Get(':id')
  getConfig(@Param('id') id: string) {
    return this.embedService.getEmbedConfig(id);
  }

  @Get('dashboard/:dashboardId')
  getByDashboard(@Param('dashboardId') dashboardId: string) {
    return this.embedService.getEmbedByDashboard(dashboardId);
  }

  @Delete(':id')
  removeConfig(@Param('id') id: string) {
    return this.embedService.removeEmbedConfig(id);
  }
}
