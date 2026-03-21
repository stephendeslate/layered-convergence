import { Module } from '@nestjs/common';
import { DataPointController } from './data-point.controller';
import { DataPointService } from './data-point.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [DataPointController],
  providers: [DataPointService, PrismaService],
  exports: [DataPointService],
})
export class DataPointModule {}
