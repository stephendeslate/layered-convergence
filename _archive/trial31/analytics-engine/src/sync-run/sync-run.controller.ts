import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { CreateSyncRunDto } from './dto/create-sync-run.dto';
import { UpdateSyncRunStatusDto } from './dto/update-sync-run-status.dto';

@Controller('sync-runs')
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Post()
  create(@Body() dto: CreateSyncRunDto) {
    return this.syncRunService.create(dto);
  }

  @Get()
  findAll(@Query('dataSourceId') dataSourceId?: string) {
    return this.syncRunService.findAll(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.syncRunService.findOne(id);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateSyncRunStatusDto) {
    return this.syncRunService.updateStatus(id, dto);
  }

  @Get('history/:dataSourceId')
  getHistory(@Param('dataSourceId') dataSourceId: string, @Query('limit') limit?: string) {
    return this.syncRunService.getHistory(dataSourceId, limit ? parseInt(limit, 10) : undefined);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.syncRunService.remove(id);
  }
}
