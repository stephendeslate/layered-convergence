import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { CreateSyncRunDto } from './dto/create-sync-run.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('sync-runs')
@UseGuards(AuthGuard)
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  private getTenantId(req: Request): string {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return tenantId;
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateSyncRunDto) {
    return this.syncRunService.create(this.getTenantId(req), dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query('pipelineId') pipelineId?: string) {
    return this.syncRunService.findAll(this.getTenantId(req), pipelineId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.syncRunService.findOne(this.getTenantId(req), id);
  }

  @Post(':id/status')
  updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { status: string; recordCount?: number; errorLog?: string },
  ) {
    return this.syncRunService.updateStatus(this.getTenantId(req), id, body.status, {
      recordCount: body.recordCount,
      errorLog: body.errorLog,
    });
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.syncRunService.remove(this.getTenantId(req), id);
  }
}
