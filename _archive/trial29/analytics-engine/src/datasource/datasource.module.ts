import { Module } from '@nestjs/common';
import { DataSourceService } from './datasource.service.js';
import { DataSourceController } from './datasource.controller.js';

@Module({
  controllers: [DataSourceController],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
