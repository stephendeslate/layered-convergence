import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';
import {
  CreateDataSourceConfigDto,
  UpdateDataSourceConfigDto,
} from './data-source-config.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('data-source-configs')
@UseGuards(AuthGuard)
export class DataSourceConfigController {
  constructor(
    private readonly dataSourceConfigService: DataSourceConfigService,
  ) {}

  @Post()
  create(@Body() dto: CreateDataSourceConfigDto) {
    return this.dataSourceConfigService.create(dto);
  }

  @Get('data-source/:dataSourceId')
  findByDataSourceId(@Param('dataSourceId') dataSourceId: string) {
    return this.dataSourceConfigService.findByDataSourceId(dataSourceId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDataSourceConfigDto) {
    return this.dataSourceConfigService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataSourceConfigService.remove(id);
  }
}
