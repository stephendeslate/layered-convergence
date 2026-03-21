import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DeadLetterEventService } from './dead-letter-event.service';
import { CreateDeadLetterEventDto } from './dto/create-dead-letter-event.dto';

@Controller('dead-letter-events')
export class DeadLetterEventController {
  constructor(private readonly service: DeadLetterEventService) {}

  @Post()
  create(@Body() dto: CreateDeadLetterEventDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('dataSourceId') dataSourceId?: string) {
    return this.service.findAll(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/retry')
  markRetried(@Param('id') id: string) {
    return this.service.markRetried(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
