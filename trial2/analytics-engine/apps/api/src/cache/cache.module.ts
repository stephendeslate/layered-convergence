import { Module } from '@nestjs/common';
import { QueryCacheService } from './cache.service';

@Module({
  providers: [QueryCacheService],
  exports: [QueryCacheService],
})
export class QueryCacheModule {}
