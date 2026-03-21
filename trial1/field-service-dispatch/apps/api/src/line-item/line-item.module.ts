import { Module } from '@nestjs/common';
import { LineItemService } from './line-item.service';
import { LineItemController } from './line-item.controller';

@Module({
  controllers: [LineItemController],
  providers: [LineItemService],
  exports: [LineItemService],
})
export class LineItemModule {}
