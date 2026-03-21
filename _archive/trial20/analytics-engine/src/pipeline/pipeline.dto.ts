import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PipelineStatus } from '@prisma/client';

export class CreatePipelineDto {
  @IsString()
  dataSourceId!: string;
}

export class TransitionPipelineDto {
  @IsEnum(PipelineStatus)
  status!: PipelineStatus;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
