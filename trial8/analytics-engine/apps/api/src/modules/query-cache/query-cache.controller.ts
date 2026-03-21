import { Controller, Post, Delete, Param } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';

@Controller('admin/query-cache')
export class QueryCacheController {
  constructor(private readonly queryCacheService: QueryCacheService) {}

  /** Admin endpoint: clear all expired cache entries. */
  @Post('clear-expired')
  clearExpired() {
    return this.queryCacheService.clearExpired();
  }

  @Delete(':queryKey')
  invalidate(@Param('queryKey') queryKey: string) {
    return this.queryCacheService.invalidate(queryKey);
  }
}
