import { Module } from '@nestjs/common';
import { DataSourcesController } from './data-sources.controller';
import { DataSourcesService } from './data-sources.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DataSourcesController],
  providers: [DataSourcesService, PrismaService],
  exports: [DataSourcesService],
})
export class DataSourcesModule {}
