import { Controller, Get, Post, Param, Body, Req, Sse } from '@nestjs/common';
import { Request } from 'express';
import { Observable, interval, map } from 'rxjs';
import { PipelineService } from './pipeline.service';
import { TriggerPipelineDto } from './dto/trigger-pipeline.dto';

@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get(':dataSourceId/status')
  getStatus(@Param('dataSourceId') dataSourceId: string) {
    return this.pipelineService.getStatus(dataSourceId);
  }

  @Post('trigger')
  trigger(@Req() req: Request, @Body() dto: TriggerPipelineDto) {
    return this.pipelineService.trigger(req.tenantId!, dto.dataSourceId);
  }

  @Post(':dataSourceId/complete')
  complete(
    @Param('dataSourceId') dataSourceId: string,
    @Body('syncRunId') syncRunId: string,
    @Body('rowsIngested') rowsIngested: number,
  ) {
    return this.pipelineService.complete(dataSourceId, syncRunId, rowsIngested);
  }

  @Post(':dataSourceId/fail')
  fail(
    @Param('dataSourceId') dataSourceId: string,
    @Body('syncRunId') syncRunId: string,
    @Body('errorLog') errorLog: string,
  ) {
    return this.pipelineService.fail(dataSourceId, syncRunId, errorLog);
  }

  @Sse(':dataSourceId/events')
  events(@Param('dataSourceId') dataSourceId: string): Observable<MessageEvent> {
    return interval(10000).pipe(
      map(() => {
        return {
          data: JSON.stringify({ dataSourceId, timestamp: new Date().toISOString() }),
          retry: 15000,
        } as unknown as MessageEvent;
      }),
    );
  }
}
