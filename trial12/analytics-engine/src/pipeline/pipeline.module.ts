import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service.js';
import { PipelineController } from './pipeline.controller.js';

@Module({
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
