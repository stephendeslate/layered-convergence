import { Module } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { DataPointController } from './data-point.controller';

@Module({
  controllers: [DataPointController],
  providers: [DataPointService],
  exports: [DataPointService],
})
export class DataPointModule {}
