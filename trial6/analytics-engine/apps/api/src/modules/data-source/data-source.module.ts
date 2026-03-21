import { Module } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { DataSourceController } from './data-source.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [DataSourceController],
  providers: [DataSourceService, PrismaService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
