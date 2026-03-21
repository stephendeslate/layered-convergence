import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Controller('api/data-sources')
@UseGuards(JwtAuthGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('tier') tier: string,
    @Body() dto: CreateDataSourceDto,
  ) {
    const data = await this.dataSourceService.create(tenantId, dto, tier);
    return { data };
  }

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dataSourceService.list(tenantId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.dataSourceService.get(id, tenantId);
    return { data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    const data = await this.dataSourceService.update(id, tenantId, dto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.dataSourceService.delete(id, tenantId);
  }

  @Post(':id/test')
  async testConnection(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.dataSourceService.testConnection(id, tenantId);
    return { data };
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerSync(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.dataSourceService.triggerSync(id, tenantId);
    return { data };
  }

  @Post(':id/resume-sync')
  async resumeSync(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.dataSourceService.resumeSync(id, tenantId);
    return { data };
  }
}
