import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { QueryCacheService } from './query-cache.service';
import { SetCacheDto } from './query-cache.dto';

@Controller('query-cache')
export class QueryCacheController {
  constructor(private readonly queryCacheService: QueryCacheService) {}

  @Get(':queryHash')
  async get(
    @Req() req: Request & { tenantId: string },
    @Param('queryHash') queryHash: string,
  ) {
    return this.queryCacheService.get(req.tenantId, queryHash);
  }

  @Post()
  async set(
    @Req() req: Request & { tenantId: string },
    @Body() dto: SetCacheDto,
  ) {
    return this.queryCacheService.set(req.tenantId, dto);
  }

  @Delete(':queryHash')
  async invalidate(
    @Req() req: Request & { tenantId: string },
    @Param('queryHash') queryHash: string,
  ) {
    return this.queryCacheService.invalidate(req.tenantId, queryHash);
  }

  @Delete()
  async invalidateAll(@Req() req: Request & { tenantId: string }) {
    return this.queryCacheService.invalidateAll(req.tenantId);
  }
}
