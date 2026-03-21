import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { SyncService } from './sync.service';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('data-sources/:id/sync-history')
  async getSyncHistory(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.syncService.getSyncHistory(id, tenantId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get('sync-runs/:id')
  async getSyncRun(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.syncService.getSyncRun(id, tenantId);
    return { data };
  }

  @Get('data-sources/:id/dead-letters')
  async getDeadLetters(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.syncService.getDeadLetterEvents(id, tenantId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('dead-letters/:id/retry')
  async retryDeadLetter(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.syncService.retryDeadLetterEvent(id, tenantId);
    return { data };
  }

  @Post('data-sources/:id/dead-letters/retry-all')
  async retryAllDeadLetters(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.syncService.retryAllDeadLetters(id, tenantId);
    return { data };
  }
}
