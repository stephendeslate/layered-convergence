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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto, UpdateEmbedConfigDto } from './dto/create-embed-config.dto';
import { Request } from 'express';

@Controller('api/v1/embeds')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: Request & { user: { tenantId: string } },
    @Body() dto: CreateEmbedConfigDto,
  ) {
    return this.embedService.create(req.user.tenantId, dto);
  }

  @Get('dashboard/:dashboardId')
  @UseGuards(AuthGuard)
  async findByDashboard(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('dashboardId') dashboardId: string,
  ) {
    return this.embedService.findByDashboard(req.user.tenantId, dashboardId);
  }

  @Get(':embedId/render')
  async getEmbedData(@Param('embedId') embedId: string) {
    const embed = await this.embedService.findOne(embedId);
    return {
      embedId: embed.id,
      dashboard: {
        id: embed.dashboard.id,
        name: embed.dashboard.name,
        widgets: embed.dashboard.widgets,
        layout: embed.dashboard.layout,
      },
      branding: embed.dashboard.tenant.branding,
      themeOverrides: embed.themeOverrides,
    };
  }

  @Patch(':embedId')
  @UseGuards(AuthGuard)
  async update(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('embedId') embedId: string,
    @Body() dto: UpdateEmbedConfigDto,
  ) {
    return this.embedService.update(req.user.tenantId, embedId, dto);
  }

  @Delete(':embedId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('embedId') embedId: string,
  ) {
    await this.embedService.remove(req.user.tenantId, embedId);
  }
}
