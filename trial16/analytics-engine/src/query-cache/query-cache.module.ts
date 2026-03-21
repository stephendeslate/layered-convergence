import { Module } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';
import { QueryCacheController } from './query-cache.controller';

@Module({
  controllers: [QueryCacheController],
  providers: [QueryCacheService],
  exports: [QueryCacheService],
})
export class QueryCacheModule {}
