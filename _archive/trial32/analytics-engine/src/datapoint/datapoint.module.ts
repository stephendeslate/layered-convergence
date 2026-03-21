import { Module } from '@nestjs/common';
import { DataPointService } from './datapoint.service.js';
import { DataPointController } from './datapoint.controller.js';

@Module({
  controllers: [DataPointController],
  providers: [DataPointService],
  exports: [DataPointService],
})
export class DataPointModule {}
