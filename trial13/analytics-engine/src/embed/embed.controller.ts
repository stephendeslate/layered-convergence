import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';

@Controller('embeds')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  create(@Body() dto: CreateEmbedConfigDto) {
    return this.embedService.create(dto);
  }

  @Get(':dashboardId')
  findByDashboard(@Param('dashboardId') dashboardId: string) {
    return this.embedService.findByDashboard(dashboardId);
  }

  @Put(':dashboardId')
  update(@Param('dashboardId') dashboardId: string, @Body() dto: UpdateEmbedConfigDto) {
    return this.embedService.update(dashboardId, dto);
  }

  @Delete(':dashboardId')
  remove(@Param('dashboardId') dashboardId: string) {
    return this.embedService.remove(dashboardId);
  }
}
