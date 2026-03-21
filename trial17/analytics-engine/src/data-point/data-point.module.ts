import { Module } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { DataPointController } from './data-point.controller';

@Module({
  providers: [DataPointService],
  controllers: [DataPointController],
  exports: [DataPointService],
})
export class DataPointModule {}
