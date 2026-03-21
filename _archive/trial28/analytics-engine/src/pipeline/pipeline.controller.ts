import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service.js';
import { UpdateSyncRunDto } from './dto/update-sync-run.dto.js';

@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post('datasources/:dataSourceId/sync')
  startSync(
    @Req() req: any,
    @Param('dataSourceId') dataSourceId: string,
  ) {
    return this.pipelineService.startSync(
      req.tenantId,
      dataSourceId,
    );
  }

  @Patch('sync-runs/:id')
  updateSyncStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSyncRunDto,
  ) {
    return this.pipelineService.updateSyncStatus(
      id,
      dto.status,
      dto.rowsIngested,
      dto.errorLog,
    );
  }

  @Get('sync-runs/:id')
  getSyncRun(@Param('id') id: string) {
    return this.pipelineService.getSyncRun(id);
  }

  @Get('datasources/:dataSourceId/sync-runs')
  getSyncRuns(@Param('dataSourceId') dataSourceId: string) {
    return this.pipelineService.getSyncRuns(dataSourceId);
  }

  @Get('datasources/:dataSourceId/dead-letter-events')
  getDeadLetterEvents(@Param('dataSourceId') dataSourceId: string) {
    return this.pipelineService.getDeadLetterEvents(dataSourceId);
  }

  @Post('dead-letter-events/:id/retry')
  retryDeadLetterEvent(@Param('id') id: string) {
    return this.pipelineService.retryDeadLetterEvent(id);
  }
}
