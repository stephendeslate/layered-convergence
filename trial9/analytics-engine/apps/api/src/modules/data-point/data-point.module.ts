import { Module } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { DataPointController } from './data-point.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [DataPointController],
  providers: [DataPointService, PrismaService],
  exports: [DataPointService],
})
export class DataPointModule {}
