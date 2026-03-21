import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSyncRunDto } from './dto/create-sync-run.dto';

@Controller('sync-runs')
@UseGuards(JwtAuthGuard)
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Get('by-source/:dataSourceId')
  findByDataSource(
    @Param('dataSourceId') dataSourceId: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.syncRunService.findByDataSource(dataSourceId, req.user.tenantId);
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.syncRunService.findById(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() dto: CreateSyncRunDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.syncRunService.create(dto, req.user.tenantId);
  }
}
