import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DeadLetterEventsService } from './dead-letter-events.service';
import { CreateDeadLetterEventDto } from './dto/create-dead-letter-event.dto';

@Controller('dead-letter-events')
export class DeadLetterEventsController {
  constructor(
    private readonly deadLetterEventsService: DeadLetterEventsService,
  ) {}

  @Get()
  findAll() {
    return this.deadLetterEventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deadLetterEventsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDeadLetterEventDto) {
    return this.deadLetterEventsService.create(dto);
  }

  @Patch(':id/retry')
  markRetried(@Param('id') id: string) {
    return this.deadLetterEventsService.markRetried(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deadLetterEventsService.remove(id);
  }
}
