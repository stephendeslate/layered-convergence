import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';
import { CacheQueryDto } from './query-cache.dto';
import { AuthGuard } from '../auth/auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('query-cache')
@UseGuards(AuthGuard)
export class QueryCacheController {
  constructor(private readonly queryCacheService: QueryCacheService) {}

  @Get(':queryHash')
  get(@TenantId() tenantId: string, @Param('queryHash') queryHash: string) {
    return this.queryCacheService.get(tenantId, queryHash);
  }

  @Post()
  set(@TenantId() tenantId: string, @Body() dto: CacheQueryDto) {
    return this.queryCacheService.set(
      tenantId,
      dto.queryHash,
      dto.result,
      dto.ttlSeconds,
    );
  }

  @Delete(':queryHash')
  invalidate(
    @TenantId() tenantId: string,
    @Param('queryHash') queryHash: string,
  ) {
    return this.queryCacheService.invalidate(tenantId, queryHash);
  }

  @Delete()
  invalidateAll(@TenantId() tenantId: string) {
    return this.queryCacheService.invalidateAll(tenantId);
  }
}
