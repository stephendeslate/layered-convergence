import { Module } from '@nestjs/common';
import { DeadLetterEventService } from './dead-letter-event.service';
import { DeadLetterEventController } from './dead-letter-event.controller';

@Module({
  controllers: [DeadLetterEventController],
  providers: [DeadLetterEventService],
  exports: [DeadLetterEventService],
})
export class DeadLetterEventModule {}
