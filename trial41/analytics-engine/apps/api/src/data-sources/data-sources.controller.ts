// TRACED:AE-DATASOURCES-CONTROLLER
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
import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { CACHE_CONTROL_LIST } from '@analytics-engine/shared';

@Controller('data-sources')
@UseGuards(JwtAuthGuard)
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDataSourceDto) {
    return this.dataSourcesService.create(user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', CACHE_CONTROL_LIST)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.dataSourcesService.findAll(
      user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dataSourcesService.findOne(id, user.tenantId);
  }

  @Put(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourcesService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dataSourcesService.remove(id, user.tenantId);
  }
}
