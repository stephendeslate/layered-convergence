import { Module } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';
import { QueryCacheController } from './query-cache.controller';

@Module({
  providers: [QueryCacheService],
  controllers: [QueryCacheController],
  exports: [QueryCacheService],
})
export class QueryCacheModule {}
