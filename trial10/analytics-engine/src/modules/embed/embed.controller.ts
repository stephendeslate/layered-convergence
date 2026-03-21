import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('embed')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post('config')
  @UseGuards(ApiKeyGuard)
  createOrUpdate(@Body() dto: CreateEmbedConfigDto) {
    return this.embedService.createOrUpdate(dto);
  }

  @Get(':dashboardId')
  getEmbedData(@Param('dashboardId') dashboardId: string) {
    return this.embedService.getEmbedData(dashboardId);
  }
}
