import {
  Controller,
  Get,
  Param,
  Headers,
} from '@nestjs/common';
import { SyncRunService } from './sync-run.service';

@Controller('sync-runs')
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  // Static route before parameterized — per v3.0 Section 5.9
  @Get('stats')
  async getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.syncRunService.getStats(tenantId);
  }

  @Get('data-source/:dataSourceId')
  async findByDataSource(
    @Headers('x-tenant-id') tenantId: string,
    @Param('dataSourceId') dataSourceId: string,
  ) {
    return this.syncRunService.findByDataSource(tenantId, dataSourceId);
  }

  @Get(':id')
  async findById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncRunService.findById(tenantId, id);
  }
}
