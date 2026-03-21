import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('widgets')
@UseGuards(AuthGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  private getTenantId(req: Request): string {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return tenantId;
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWidgetDto) {
    return this.widgetService.create(this.getTenantId(req), dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query('dashboardId') dashboardId?: string) {
    return this.widgetService.findAll(this.getTenantId(req), dashboardId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.widgetService.findOne(this.getTenantId(req), id);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(this.getTenantId(req), id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.widgetService.remove(this.getTenantId(req), id);
  }
}
