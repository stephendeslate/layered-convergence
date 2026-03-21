import { Module } from '@nestjs/common';
import { WidgetService } from './widget.service.js';
import { WidgetController } from './widget.controller.js';

@Module({
  controllers: [WidgetController],
  providers: [WidgetService],
  exports: [WidgetService],
})
export class WidgetModule {}
