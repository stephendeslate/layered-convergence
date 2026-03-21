import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EmbedConfigService } from './embed-config.service';
import { CreateEmbedConfigDto, UpdateEmbedConfigDto } from './embed-config.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('embed-configs')
@UseGuards(ApiKeyGuard)
export class EmbedConfigController {
  constructor(private readonly embedConfigService: EmbedConfigService) {}

  @Post()
  create(@Body() dto: CreateEmbedConfigDto) {
    return this.embedConfigService.create(dto);
  }

  @Get('dashboard/:dashboardId')
  findByDashboard(@Param('dashboardId') dashboardId: string) {
    return this.embedConfigService.findByDashboard(dashboardId);
  }

  @Get('resolve/:dashboardId')
  resolveForEmbed(@Param('dashboardId') dashboardId: string) {
    return this.embedConfigService.resolveForEmbed(dashboardId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmbedConfigDto) {
    return this.embedConfigService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.embedConfigService.delete(id);
  }
}
