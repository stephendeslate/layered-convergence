import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { EmbedService } from './embed.service.js';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto.js';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto.js';

@Controller('embed')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post('config')
  createConfig(@Body() dto: CreateEmbedConfigDto) {
    return this.embedService.createConfig(dto);
  }

  @Get('config/:dashboardId')
  getConfig(@Param('dashboardId') dashboardId: string) {
    return this.embedService.getConfig(dashboardId);
  }

  @Put('config/:dashboardId')
  updateConfig(
    @Param('dashboardId') dashboardId: string,
    @Body() dto: UpdateEmbedConfigDto,
  ) {
    return this.embedService.updateConfig(dashboardId, dto);
  }

  @Get('render/:apiKey')
  renderByApiKey(@Param('apiKey') apiKey: string) {
    return this.embedService.renderByApiKey(apiKey);
  }
}
