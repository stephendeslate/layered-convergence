import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';
import { EmbedConfigsService } from './embed-configs.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';

@Controller('embed-configs')
@UseFilters(PrismaExceptionFilter)
export class EmbedConfigsController {
  constructor(private readonly service: EmbedConfigsService) {}

  @Post()
  create(@Body() dto: CreateEmbedConfigDto) {
    return this.service.create(dto);
  }

  @Get(':dashboardId')
  findByDashboard(@Param('dashboardId') dashboardId: string) {
    return this.service.findByDashboard(dashboardId);
  }

  @Patch(':dashboardId')
  update(
    @Param('dashboardId') dashboardId: string,
    @Body() dto: UpdateEmbedConfigDto,
  ) {
    return this.service.update(dashboardId, dto);
  }

  @Delete(':dashboardId')
  remove(@Param('dashboardId') dashboardId: string) {
    return this.service.remove(dashboardId);
  }
}
