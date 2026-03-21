import { Module } from '@nestjs/common';
import { QueryCacheService } from './query-cache.service';
import { QueryCacheController } from './query-cache.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [QueryCacheService],
  controllers: [QueryCacheController],
  exports: [QueryCacheService],
})
export class QueryCacheModule {}
