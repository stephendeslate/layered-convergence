import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  Sse,
  UseGuards,
  BadRequestException,
  MessageEvent,
} from '@nestjs/common';
import { Observable, interval, map, switchMap, from } from 'rxjs';
import { PipelineService } from './pipeline.service';
import { TriggerPipelineDto } from './dto/trigger-pipeline.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('pipelines')
@UseGuards(AuthGuard)
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  private getTenantId(req: Request): string {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return tenantId;
  }

  @Post()
  create(@Req() req: Request, @Body() dto: TriggerPipelineDto) {
    return this.pipelineService.create(this.getTenantId(req), {
      name: dto.name,
      dataSourceId: dto.dataSourceId,
    });
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.pipelineService.findAll(this.getTenantId(req));
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.pipelineService.findOne(this.getTenantId(req), id);
  }

  @Post(':id/trigger')
  trigger(@Req() req: Request, @Param('id') id: string) {
    return this.pipelineService.trigger(this.getTenantId(req), id);
  }

  @Post(':id/complete')
  complete(@Req() req: Request, @Param('id') id: string) {
    return this.pipelineService.complete(this.getTenantId(req), id);
  }

  @Post(':id/fail')
  fail(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('errorMessage') errorMessage: string,
  ) {
    return this.pipelineService.fail(
      this.getTenantId(req),
      id,
      errorMessage ?? 'Unknown error',
    );
  }

  @Post(':id/reset')
  reset(@Req() req: Request, @Param('id') id: string) {
    return this.pipelineService.reset(this.getTenantId(req), id);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.pipelineService.remove(this.getTenantId(req), id);
  }

  @Sse(':id/events')
  events(
    @Req() req: Request,
    @Param('id') id: string,
  ): Observable<MessageEvent> {
    const tenantId = this.getTenantId(req);

    return interval(2000).pipe(
      switchMap(() => from(this.pipelineService.findOne(tenantId, id))),
      map(
        (pipeline) =>
          ({
            data: JSON.stringify({
              id: pipeline.id,
              status: pipeline.status,
              lastRunAt: pipeline.lastRunAt,
              errorMessage: pipeline.errorMessage,
              retry: 5000,
            }),
            type: 'pipeline-status',
            retry: 5000,
          }) as MessageEvent,
      ),
    );
  }
}
