import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeadLetterService } from './dead-letter.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('dead-letter')
@UseGuards(ApiKeyGuard)
export class DeadLetterController {
  constructor(private readonly deadLetterService: DeadLetterService) {}

  @Get(':dataSourceId')
  findByDataSource(@Param('dataSourceId') dataSourceId: string) {
    return this.deadLetterService.findByDataSource(dataSourceId);
  }

  @Post(':id/retry')
  retry(@Param('id') id: string) {
    return this.deadLetterService.retry(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deadLetterService.remove(id);
  }
}
