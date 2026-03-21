import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { CreateSyncRunDto } from './dto/create-sync-run.dto';

@Controller('sync-runs')
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Post()
  create(@Body() dto: CreateSyncRunDto) {
    return this.syncRunService.create(dto.dataSourceId);
  }

  @Get('data-source/:dataSourceId')
  findByDataSource(@Param('dataSourceId') dataSourceId: string) {
    return this.syncRunService.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.syncRunService.findOne(id);
  }
}
