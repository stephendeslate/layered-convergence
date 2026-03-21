import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';
import { SetCacheDto } from './query-cache.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('query-cache')
@UseGuards(AuthGuard)
export class QueryCacheController {
  constructor(private readonly queryCacheService: QueryCacheService) {}

  @Get(':queryHash')
  get(@Req() req: Request, @Param('queryHash') queryHash: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.queryCacheService.get(tenantId, queryHash);
  }

  @Post()
  set(@Req() req: Request, @Body() dto: SetCacheDto) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.queryCacheService.set(tenantId, dto);
  }

  @Delete(':queryHash')
  invalidate(@Req() req: Request, @Param('queryHash') queryHash: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.queryCacheService.invalidate(tenantId, queryHash);
  }

  @Delete()
  invalidateAll(@Req() req: Request) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.queryCacheService.invalidateAll(tenantId);
  }
}
