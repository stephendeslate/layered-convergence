import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('embed')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post('config')
  @UseGuards(ApiKeyGuard)
  createConfig(@Body() dto: CreateEmbedConfigDto) {
    return this.embedService.createConfig(dto);
  }

  @Get('config/:dashboardId')
  @UseGuards(ApiKeyGuard)
  getConfig(@Param('dashboardId') dashboardId: string) {
    return this.embedService.getConfig(dashboardId);
  }

  @Put('config/:dashboardId')
  @UseGuards(ApiKeyGuard)
  updateConfig(
    @Param('dashboardId') dashboardId: string,
    @Body() dto: UpdateEmbedConfigDto,
  ) {
    return this.embedService.updateConfig(dashboardId, dto);
  }

  /** Public endpoint: serves embed data to iframe consumers. */
  @Get(':dashboardId')
  getEmbedData(
    @Param('dashboardId') dashboardId: string,
    @Headers('origin') origin?: string,
  ) {
    return this.embedService.getEmbedData(dashboardId, origin);
  }

  @Get(':dashboardId/code')
  @UseGuards(ApiKeyGuard)
  generateEmbedCode(@Param('dashboardId') dashboardId: string) {
    return this.embedService.generateEmbedCode(dashboardId);
  }
}
