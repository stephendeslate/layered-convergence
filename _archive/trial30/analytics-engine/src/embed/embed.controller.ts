import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
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

  @Get('dashboard/:dashboardId')
  findByDashboard(@Param('dashboardId') dashboardId: string) {
    return this.embedService.findByDashboard(dashboardId);
  }

  @Get('resolve/:dashboardId')
  resolveEmbed(
    @Param('dashboardId') dashboardId: string,
    @Headers('origin') origin?: string,
  ) {
    return this.embedService.resolveEmbed(dashboardId, origin);
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
