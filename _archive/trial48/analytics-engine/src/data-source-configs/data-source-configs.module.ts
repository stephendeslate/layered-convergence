import { Module } from '@nestjs/common';
import { DataSourceConfigsService } from './data-source-configs.service';
import { DataSourceConfigsController } from './data-source-configs.controller';

@Module({
  controllers: [DataSourceConfigsController],
  providers: [DataSourceConfigsService],
  exports: [DataSourceConfigsService],
})
export class DataSourceConfigsModule {}
