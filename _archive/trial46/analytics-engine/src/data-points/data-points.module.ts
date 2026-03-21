import { Module } from '@nestjs/common';
import { DataPointsService } from './data-points.service';
import { DataPointsController } from './data-points.controller';

@Module({
  controllers: [DataPointsController],
  providers: [DataPointsService],
  exports: [DataPointsService],
})
export class DataPointsModule {}
