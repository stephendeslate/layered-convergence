import { Module } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { WidgetController } from './widget.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [WidgetController],
  providers: [WidgetService, PrismaService],
  exports: [WidgetService],
})
export class WidgetModule {}
