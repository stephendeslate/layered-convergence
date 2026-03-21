import { Module } from '@nestjs/common';
import { QueryCacheController } from './query-cache.controller';
import { QueryCacheService } from './query-cache.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [QueryCacheController],
  providers: [QueryCacheService, PrismaService],
  exports: [QueryCacheService],
})
export class QueryCacheModule {}
