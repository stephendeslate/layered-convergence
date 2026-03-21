import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { QueryModule } from '../query/query.module';

@Module({
  imports: [QueryModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
