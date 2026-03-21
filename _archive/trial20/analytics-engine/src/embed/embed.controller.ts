import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto, UpdateEmbedConfigDto } from './embed.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('embeds')
@UseGuards(AuthGuard)
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  create(@Body() dto: CreateEmbedConfigDto) {
    return this.embedService.create(dto);
  }

  @Get('dashboard/:dashboardId')
  findByDashboardId(@Param('dashboardId') dashboardId: string) {
    return this.embedService.findByDashboardId(dashboardId);
  }

  @Get('dashboard/:dashboardId/code')
  generateEmbedCode(
    @Param('dashboardId') dashboardId: string,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.embedService.generateEmbedCode(dashboardId, baseUrl);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmbedConfigDto) {
    return this.embedService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.embedService.remove(id);
  }
}
