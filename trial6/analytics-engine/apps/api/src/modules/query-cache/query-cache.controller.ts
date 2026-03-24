import { Controller, Get, Post, Body } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';
import { InvalidateCacheDto } from './dto/invalidate-cache.dto';

/**
 * Admin endpoint for monitoring and managing the query cache.
 * Addresses CED v6.0 Convention 5.18 — background service observability.
 */
@Controller('admin/cache')
export class QueryCacheController {
  constructor(private readonly queryCacheService: QueryCacheService) {}

  @Get('status')
  getStatus() {
    return this.queryCacheService.getStatus();
  }

  @Post('invalidate')
  invalidate(@Body() dto: InvalidateCacheDto) {
    return this.queryCacheService.invalidate(dto);
  }
}
