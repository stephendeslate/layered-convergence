import { Module } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { DataSourcesController } from './data-sources.controller';

@Module({
  providers: [DataSourcesService],
  controllers: [DataSourcesController],
  exports: [DataSourcesService],
})
export class DataSourcesModule {}
