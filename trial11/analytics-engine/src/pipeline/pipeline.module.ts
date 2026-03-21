import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service.js';
import { PipelineController } from './pipeline.controller.js';
import { PipelineProcessor } from './pipeline.processor.js';

@Module({
  controllers: [PipelineController],
  providers: [PipelineService, PipelineProcessor],
  exports: [PipelineService],
})
export class PipelineModule {}
