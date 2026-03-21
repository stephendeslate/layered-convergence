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
import { DataSourceConfigService } from './data-source-config.service';
import { CreateDataSourceConfigDto } from './dto/create-data-source-config.dto';
import { UpdateDataSourceConfigDto } from './dto/update-data-source-config.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('data-source-configs')
@UseGuards(AuthGuard)
export class DataSourceConfigController {
  constructor(private readonly configService: DataSourceConfigService) {}

  private getTenantId(req: Request): string {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return tenantId;
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDataSourceConfigDto) {
    return this.configService.create(this.getTenantId(req), dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query('dataSourceId') dataSourceId?: string) {
    return this.configService.findAll(this.getTenantId(req), dataSourceId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.configService.findOne(this.getTenantId(req), id);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceConfigDto,
  ) {
    return this.configService.update(this.getTenantId(req), id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.configService.remove(this.getTenantId(req), id);
  }
}
