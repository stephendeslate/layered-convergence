import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { CreateSyncRunDto, UpdateSyncRunDto } from './sync-run.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('sync-runs')
@UseGuards(AuthGuard)
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Post()
  create(@Body() dto: CreateSyncRunDto) {
    return this.syncRunService.create(dto);
  }

  @Get('data-source/:dataSourceId')
  findByDataSourceId(@Param('dataSourceId') dataSourceId: string) {
    return this.syncRunService.findByDataSourceId(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.syncRunService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSyncRunDto) {
    return this.syncRunService.update(id, dto);
  }
}
