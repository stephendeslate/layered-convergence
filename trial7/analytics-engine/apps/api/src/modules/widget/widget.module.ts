import { Module } from '@nestjs/common';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [WidgetController],
  providers: [WidgetService, PrismaService],
  exports: [WidgetService],
})
export class WidgetModule {}
