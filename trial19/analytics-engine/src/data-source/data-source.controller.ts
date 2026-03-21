import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.dataSourceService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dataSourceService.findOne(req.tenantId, id);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(req.tenantId, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dataSourceService.remove(req.tenantId, id);
  }
}
