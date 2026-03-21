import { Module } from '@nestjs/common';
import { DeadLetterService } from './dead-letter.service';
import { DeadLetterController } from './dead-letter.controller';

@Module({
  controllers: [DeadLetterController],
  providers: [DeadLetterService],
  exports: [DeadLetterService],
})
export class DeadLetterModule {}
