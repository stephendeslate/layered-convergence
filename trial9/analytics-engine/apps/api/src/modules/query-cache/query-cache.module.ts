import { Module } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';
import { PrismaService } from '../../config/prisma.service';

@Module({
  providers: [QueryCacheService, PrismaService],
  exports: [QueryCacheService],
})
export class QueryCacheModule {}
