import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';

@Controller('embed-configs')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  create(@Body() dto: CreateEmbedConfigDto) {
    return this.embedService.create(dto);
  }

  @Get()
  findByDashboard(@Query('dashboardId') dashboardId: string) {
    return this.embedService.findByDashboard(dashboardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.embedService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmbedConfigDto) {
    return this.embedService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.embedService.remove(id);
  }
}
