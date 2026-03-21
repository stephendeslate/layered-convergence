import { Module } from '@nestjs/common';
import { DataSourceService } from './data-source.service.js';
import { DataSourceController } from './data-source.controller.js';

@Module({
  controllers: [DataSourceController],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
