import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { PipelineStatus } from '@prisma/client';

export class CreatePipelineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @IsOptional()
  config?: Record<string, unknown>;
}

export class TransitionPipelineDto {
  @IsIn([PipelineStatus.DRAFT, PipelineStatus.ACTIVE, PipelineStatus.PAUSED, PipelineStatus.ARCHIVED])
  status!: PipelineStatus;
}
