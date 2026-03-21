import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('query-cache')
export class QueryCacheController {
  constructor(private readonly queryCacheService: QueryCacheService) {}

  @Get(':queryHash')
  get(@Param('queryHash') queryHash: string) {
    return this.queryCacheService.get(queryHash);
  }

  @Delete(':queryHash')
  @Roles(Role.ADMIN)
  invalidate(@Param('queryHash') queryHash: string) {
    return this.queryCacheService.invalidate(queryHash);
  }

  @Post('purge')
  @Roles(Role.ADMIN)
  purge() {
    return this.queryCacheService.purgeExpired();
  }
}
