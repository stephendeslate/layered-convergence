import { Module } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { DataSourceController } from './data-source.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [DataSourceService],
  controllers: [DataSourceController],
  exports: [DataSourceService],
})
export class DataSourceModule {}
