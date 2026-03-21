import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PipelineController } from './pipeline.controller';
import { TenantContextModule } from '../tenant/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
