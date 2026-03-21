import { Module } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import { PhotosController } from './photos.controller';

@Module({
  providers: [WorkOrdersService],
  controllers: [WorkOrdersController, PhotosController],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
