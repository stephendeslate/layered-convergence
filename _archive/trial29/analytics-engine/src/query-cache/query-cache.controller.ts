import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service.js';

@Controller('query-cache')
export class QueryCacheController {
  constructor(private readonly queryCacheService: QueryCacheService) {}

  @Get(':queryHash')
  get(@Param('queryHash') queryHash: string) {
    return this.queryCacheService.get(queryHash);
  }

  @Post()
  set(
    @Body()
    body: {
      query: Record<string, any>;
      result: Record<string, any>;
      ttlSeconds?: number;
    },
  ) {
    const queryHash = this.queryCacheService.generateHash(body.query);
    return this.queryCacheService.set(
      queryHash,
      body.result,
      body.ttlSeconds,
    );
  }

  @Delete(':queryHash')
  invalidate(@Param('queryHash') queryHash: string) {
    return this.queryCacheService.invalidate(queryHash);
  }

  @Delete()
  invalidateAll() {
    return this.queryCacheService.invalidateAll();
  }
}
