import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

/**
 * Admin endpoints for the query cache background service.
 * Convention 5.18: background services must have admin endpoints.
 */
@Controller('admin/query-cache')
@UseGuards(ApiKeyGuard)
export class QueryCacheController {
  constructor(private readonly queryCacheService: QueryCacheService) {}

  @Get('stats')
  getStats() {
    return this.queryCacheService.getStats();
  }

  @Post('clear-expired')
  clearExpired() {
    return this.queryCacheService.clearExpired();
  }
}
