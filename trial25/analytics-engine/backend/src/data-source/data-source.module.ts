import { Module } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { DataSourceController } from './data-source.controller';
import { TenantContextModule } from '../tenant/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  controllers: [DataSourceController],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
