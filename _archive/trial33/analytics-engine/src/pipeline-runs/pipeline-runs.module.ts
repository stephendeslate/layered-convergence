import { Module } from '@nestjs/common';
import { PipelineRunsService } from './pipeline-runs.service';
import { PipelineRunsController } from './pipeline-runs.controller';

@Module({
  providers: [PipelineRunsService],
  controllers: [PipelineRunsController],
  exports: [PipelineRunsService],
})
export class PipelineRunsModule {}
