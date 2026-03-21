import { Module } from '@nestjs/common';
import { DeadLetterEventsService } from './dead-letter-events.service';
import { DeadLetterEventsController } from './dead-letter-events.controller';

@Module({
  controllers: [DeadLetterEventsController],
  providers: [DeadLetterEventsService],
  exports: [DeadLetterEventsService],
})
export class DeadLetterEventsModule {}
