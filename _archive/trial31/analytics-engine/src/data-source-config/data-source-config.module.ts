import { Module } from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';
import { DataSourceConfigController } from './data-source-config.controller';

@Module({
  controllers: [DataSourceConfigController],
  providers: [DataSourceConfigService],
  exports: [DataSourceConfigService],
})
export class DataSourceConfigModule {}
