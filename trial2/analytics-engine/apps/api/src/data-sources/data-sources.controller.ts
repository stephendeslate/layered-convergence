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
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { Request } from 'express';

@Controller('api/v1/data-sources')
@UseGuards(AuthGuard)
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Post()
  async create(
    @Req() req: Request & { user: { tenantId: string } },
    @Body() dto: CreateDataSourceDto,
  ) {
    return this.dataSourcesService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request & { user: { tenantId: string } },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.dataSourcesService.findAll(
      req.user.tenantId,
      cursor,
      limit ? parseInt(limit, 10) : undefined,
      type,
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.dataSourcesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourcesService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    await this.dataSourcesService.remove(req.user.tenantId, id);
  }
}
