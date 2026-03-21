import { Module } from '@nestjs/common';
import { DataPointService } from './data-point.service.js';
import { DataPointController } from './data-point.controller.js';

@Module({
  controllers: [DataPointController],
  providers: [DataPointService],
  exports: [DataPointService],
})
export class DataPointModule {}
