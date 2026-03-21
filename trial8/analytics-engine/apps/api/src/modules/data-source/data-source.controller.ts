import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { ConfigureDataSourceDto } from './dto/configure-data-source.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@Controller('data-sources')
@UseGuards(ApiKeyGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(
    @CurrentTenant() tenant: { id: string },
    @Body() dto: CreateDataSourceDto,
  ) {
    return this.dataSourceService.create(tenant.id, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenant: { id: string }) {
    return this.dataSourceService.findAllByTenant(tenant.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataSourceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDataSourceDto) {
    return this.dataSourceService.update(id, dto);
  }

  @Post(':id/configure')
  configure(@Param('id') id: string, @Body() dto: ConfigureDataSourceDto) {
    return this.dataSourceService.configure(id, dto);
  }

  @Get(':id/webhook-url')
  getWebhookUrl(@Param('id') id: string) {
    return this.dataSourceService.getWebhookIngestUrl(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataSourceService.remove(id);
  }
}
