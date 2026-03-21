import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsUUID,
  IsIn,
} from 'class-validator';

export const PIPELINE_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'FAILED',
  'COMPLETED',
] as const;

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

/**
 * Valid state transitions for the pipeline state machine:
 * DRAFT -> ACTIVE
 * ACTIVE -> PAUSED, FAILED, COMPLETED
 * PAUSED -> ACTIVE
 * FAILED -> DRAFT
 * ACTIVE -> COMPLETED (terminal, can reset)
 */
export const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['PAUSED', 'FAILED', 'COMPLETED'],
  PAUSED: ['ACTIVE'],
  FAILED: ['DRAFT'],
  COMPLETED: ['DRAFT'],
};

export class CreatePipelineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsUUID()
  dataSourceId!: string;
}

export class UpdatePipelineDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class TransitionPipelineDto {
  @IsString()
  @IsIn(PIPELINE_STATUSES)
  targetStatus!: PipelineStatus;
}
