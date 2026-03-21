import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { DeadLetterService } from './dead-letter.service';
import { DeadLetterQueryDto } from './dto/dead-letter-query.dto';
import { RetryDeadLetterDto } from './dto/retry-dead-letter.dto';

@Controller('dead-letters')
export class DeadLetterController {
  constructor(private readonly deadLetterService: DeadLetterService) {}

  @Get()
  findAll(@Query() query: DeadLetterQueryDto) {
    return this.deadLetterService.findAll(query);
  }

  @Post('retry')
  retry(@Body() dto: RetryDeadLetterDto) {
    return this.deadLetterService.retry(dto.eventId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deadLetterService.remove(id);
  }
}
