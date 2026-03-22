// TRACED:AE-DASHBOARDS-CONTROLLER
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Header,
} from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { CACHE_CONTROL_LIST } from '@analytics-engine/shared';

@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDashboardDto) {
    return this.dashboardsService.create(user.tenantId, user.sub, dto);
  }

  @Get()
  @Header('Cache-Control', CACHE_CONTROL_LIST)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.dashboardsService.findAll(
      user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dashboardsService.findOne(id, user.tenantId);
  }

  @Put(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardsService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dashboardsService.remove(id, user.tenantId);
  }
}
