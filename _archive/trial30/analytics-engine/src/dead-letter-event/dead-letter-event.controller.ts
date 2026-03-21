import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { DeadLetterEventService } from './dead-letter-event.service';

@Controller('dead-letter-events')
export class DeadLetterEventController {
  constructor(private readonly deadLetterEventService: DeadLetterEventService) {}

  @Get()
  findAll(@Query('dataSourceId') dataSourceId?: string) {
    return this.deadLetterEventService.findAll(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deadLetterEventService.findOne(id);
  }

  @Post(':id/retry')
  retry(@Param('id') id: string) {
    return this.deadLetterEventService.retry(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deadLetterEventService.remove(id);
  }
}
