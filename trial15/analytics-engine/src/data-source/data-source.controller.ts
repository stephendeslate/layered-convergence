import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('data-sources')
@UseGuards(AuthGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  private getTenantId(req: Request): string {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return tenantId;
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(this.getTenantId(req), dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.dataSourceService.findAll(this.getTenantId(req));
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.findOne(this.getTenantId(req), id);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(this.getTenantId(req), id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.remove(this.getTenantId(req), id);
  }
}
