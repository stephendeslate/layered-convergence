import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { DeadLetterEventsService } from './dead-letter-events.service';
import { CreateDeadLetterEventDto } from './dto/create-dead-letter-event.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';

@Controller('dead-letter-events')
@UseFilters(PrismaExceptionFilter)
export class DeadLetterEventsController {
  constructor(private readonly service: DeadLetterEventsService) {}

  @Post()
  create(@Body() dto: CreateDeadLetterEventDto) {
    return this.service.create(dto);
  }

  @Get()
  findByDataSource(@Query('dataSourceId') dataSourceId: string) {
    return this.service.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/retry')
  retry(@Param('id') id: string) {
    return this.service.retry(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
