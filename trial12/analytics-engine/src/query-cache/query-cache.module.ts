import { Module } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service.js';
import { QueryCacheController } from './query-cache.controller.js';

@Module({
  controllers: [QueryCacheController],
  providers: [QueryCacheService],
  exports: [QueryCacheService],
})
export class QueryCacheModule {}
