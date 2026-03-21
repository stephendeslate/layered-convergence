import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Headers,
} from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';

@Controller('embed')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post('config')
  createConfig(@Body() dto: CreateEmbedConfigDto) {
    return this.embedService.createConfig(dto);
  }

  @Get('config/:dashboardId')
  findConfig(@Param('dashboardId') dashboardId: string) {
    return this.embedService.findConfigByDashboard(dashboardId);
  }

  @Patch('config/:dashboardId')
  updateConfig(
    @Param('dashboardId') dashboardId: string,
    @Body() dto: Partial<CreateEmbedConfigDto>,
  ) {
    return this.embedService.updateConfig(dashboardId, dto);
  }

  @Get(':dashboardId')
  getEmbedData(
    @Param('dashboardId') dashboardId: string,
    @Headers('origin') origin?: string,
  ) {
    return this.embedService.getEmbedData(dashboardId, origin);
  }
}
