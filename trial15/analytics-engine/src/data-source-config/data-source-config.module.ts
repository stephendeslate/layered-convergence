import { Module } from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';
import { DataSourceConfigController } from './data-source-config.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DataSourceConfigController],
  providers: [DataSourceConfigService],
  exports: [DataSourceConfigService],
})
export class DataSourceConfigModule {}
