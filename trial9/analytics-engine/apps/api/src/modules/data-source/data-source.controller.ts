import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@Controller('data-sources')
@UseGuards(ApiKeyGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@CurrentTenant() tenant: { id: string }, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(tenant.id, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenant: { id: string }) {
    return this.dataSourceService.findAllByTenant(tenant.id);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dataSourceService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDataSourceDto) {
    return this.dataSourceService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.dataSourceService.delete(id);
  }
}
