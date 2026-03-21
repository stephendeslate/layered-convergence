import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryController } from './query.controller';
import { AggregationModule } from '../aggregation/aggregation.module';
import { QueryCacheModule } from '../cache/cache.module';

@Module({
  imports: [AggregationModule, QueryCacheModule],
  controllers: [QueryController],
  providers: [QueryService],
  exports: [QueryService],
})
export class QueryModule {}
