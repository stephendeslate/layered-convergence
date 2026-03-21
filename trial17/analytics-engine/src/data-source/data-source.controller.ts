import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(
    @Req() req: Request & { tenantId: string },
    @Body() dto: CreateDataSourceDto,
  ) {
    return this.dataSourceService.create(req.tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: Request & { tenantId: string }) {
    return this.dataSourceService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.dataSourceService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.dataSourceService.remove(req.tenantId, id);
  }
}
