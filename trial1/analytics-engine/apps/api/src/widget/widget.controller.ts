import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post('dashboards/:dashboardId/widgets')
  async create(
    @Param('dashboardId') dashboardId: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    const data = await this.widgetService.create(
      dashboardId,
      tenantId,
      dto,
    );
    return { data };
  }

  @Patch('dashboards/:dashboardId/widgets/:id')
  async update(
    @Param('id') id: string,
    @Param('dashboardId') dashboardId: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    const data = await this.widgetService.update(
      id,
      dashboardId,
      tenantId,
      dto,
    );
    return { data };
  }

  @Delete('dashboards/:dashboardId/widgets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Param('dashboardId') dashboardId: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.widgetService.delete(id, dashboardId, tenantId);
  }

  @Post('dashboards/:dashboardId/widgets/reorder')
  async reorder(
    @Param('dashboardId') dashboardId: string,
    @CurrentTenant() tenantId: string,
    @Body() body: { positions: { id: string; sortOrder: number }[] },
  ) {
    await this.widgetService.reorder(
      dashboardId,
      tenantId,
      body.positions,
    );
    return { data: { message: 'Widgets reordered' } };
  }

  @Get('widgets/:id/data')
  async getData(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('tier') tier: string,
    @Query('dateStart') dateStart?: string,
    @Query('dateEnd') dateEnd?: string,
  ) {
    const data = await this.widgetService.getData(id, tenantId, tier, {
      dateStart,
      dateEnd,
    });
    return { data };
  }
}
