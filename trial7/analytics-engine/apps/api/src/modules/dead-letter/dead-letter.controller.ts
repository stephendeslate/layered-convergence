import { Controller, Get, Post, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { DeadLetterService } from './dead-letter.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('dead-letters')
@UseGuards(ApiKeyGuard)
export class DeadLetterController {
  constructor(private readonly deadLetterService: DeadLetterService) {}

  @Get()
  findByDataSource(@Query('dataSourceId') dataSourceId: string) {
    return this.deadLetterService.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deadLetterService.findOneOrThrow(id);
  }

  @Post(':id/retry')
  retry(@Param('id') id: string) {
    return this.deadLetterService.markRetried(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deadLetterService.remove(id);
  }
}
