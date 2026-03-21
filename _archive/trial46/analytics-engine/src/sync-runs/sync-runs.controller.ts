import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { SyncRunsService } from './sync-runs.service';
import { CreateSyncRunDto } from './dto/create-sync-run.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';

@Controller('sync-runs')
@UseFilters(PrismaExceptionFilter)
export class SyncRunsController {
  constructor(private readonly syncRunsService: SyncRunsService) {}

  @Post()
  create(@Body() dto: CreateSyncRunDto) {
    return this.syncRunsService.create(dto);
  }

  @Get()
  findByDataSource(@Query('dataSourceId') dataSourceId: string) {
    return this.syncRunsService.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.syncRunsService.findById(id);
  }
}
