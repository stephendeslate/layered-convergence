import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { SyncRunService } from './sync-run.service';
import { CreateSyncRunDto, UpdateSyncRunDto } from './sync-run.dto';

@Controller('sync-runs')
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Post()
  async create(
    @Req() req: Request & { tenantId: string },
    @Body() dto: CreateSyncRunDto,
  ) {
    return this.syncRunService.create(req.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request & { tenantId: string },
    @Query('dataSourceId') dataSourceId?: string,
  ) {
    return this.syncRunService.findAll(req.tenantId, dataSourceId);
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.syncRunService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateSyncRunDto,
  ) {
    return this.syncRunService.update(req.tenantId, id, dto);
  }
}
