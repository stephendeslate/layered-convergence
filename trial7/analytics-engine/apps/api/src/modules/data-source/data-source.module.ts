import { Module } from '@nestjs/common';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [DataSourceController],
  providers: [DataSourceService, PrismaService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
