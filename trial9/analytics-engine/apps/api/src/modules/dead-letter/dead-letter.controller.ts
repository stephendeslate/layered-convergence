import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeadLetterService } from './dead-letter.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('dead-letters')
@UseGuards(ApiKeyGuard)
export class DeadLetterController {
  constructor(private readonly deadLetterService: DeadLetterService) {}

  @Get('data-source/:dataSourceId')
  findByDataSource(@Param('dataSourceId') dataSourceId: string) {
    return this.deadLetterService.findByDataSource(dataSourceId);
  }

  @Post(':id/retry')
  retry(@Param('id') id: string) {
    return this.deadLetterService.retry(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deadLetterService.delete(id);
  }
}
