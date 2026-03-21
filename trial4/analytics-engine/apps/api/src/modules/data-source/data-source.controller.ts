import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto, UpdateDataSourceDto, ConfigureDataSourceDto } from './data-source.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateDataSourceDto,
  ) {
    return this.dataSourceService.create(tenantId, dto);
  }

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.dataSourceService.findAllByTenant(tenantId);
  }

  @Get(':id')
  async findById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.dataSourceService.findById(tenantId, id);
  }

  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(tenantId, id, dto);
  }

  @Post(':id/configure')
  async configure(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: ConfigureDataSourceDto,
  ) {
    return this.dataSourceService.configure(tenantId, id, dto);
  }

  @Delete(':id')
  async delete(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.dataSourceService.delete(tenantId, id);
  }
}
