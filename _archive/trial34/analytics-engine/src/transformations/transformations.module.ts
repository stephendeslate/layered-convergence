import { Module } from '@nestjs/common';
import { TransformationsService } from './transformations.service';
import { TransformationsController } from './transformations.controller';

@Module({
  providers: [TransformationsService],
  controllers: [TransformationsController],
  exports: [TransformationsService],
})
export class TransformationsModule {}
