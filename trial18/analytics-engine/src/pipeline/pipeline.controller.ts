import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Sse } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { PipelineService } from './pipeline.service';
import { CreatePipelineDto, TransitionPipelineDto } from './pipeline.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

interface MessageEvent {
  data: string;
}

@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.pipelineService.findAll(req.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.pipelineService.findOne(req.tenantId, id);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePipelineDto) {
    return this.pipelineService.create(req.tenantId, dto);
  }

  @Patch(':id/transition')
  transition(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: TransitionPipelineDto,
  ) {
    return this.pipelineService.transition(req.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.pipelineService.remove(req.tenantId, id);
  }

  @Sse(':id/monitor')
  monitor(@Req() req: AuthenticatedRequest, @Param('id') id: string): Observable<MessageEvent> {
    const tenantId = req.tenantId;

    return interval(3000).pipe(
      map(() => {
        return {
          data: JSON.stringify({
            pipelineId: id,
            tenantId,
            timestamp: new Date().toISOString(),
            status: 'polling',
          }),
        };
      }),
    );
  }
}
