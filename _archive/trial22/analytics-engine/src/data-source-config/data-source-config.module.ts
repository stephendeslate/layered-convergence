import { Module } from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';
import { DataSourceConfigController } from './data-source-config.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [DataSourceConfigService],
  controllers: [DataSourceConfigController],
  exports: [DataSourceConfigService],
})
export class DataSourceConfigModule {}
