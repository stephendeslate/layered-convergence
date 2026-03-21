import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaExceptionFilter } from '../common/prisma-exception.filter';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.dto';

@Controller('data-sources')
@UseGuards(AuthGuard)
@UseFilters(PrismaExceptionFilter)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateDataSourceDto,
  ) {
    return this.dataSourceService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: Request & { user: JwtPayload }) {
    return this.dataSourceService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.dataSourceService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    await this.dataSourceService.remove(req.user.tenantId, id);
  }
}
