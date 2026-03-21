import { Module } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { DataSourceController } from './data-source.controller';
import { TenantContextModule } from '../tenant-context/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  providers: [DataSourceService],
  controllers: [DataSourceController],
  exports: [DataSourceService],
})
export class DataSourceModule {}
