import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { PipelineStatus } from '@prisma/client';

export class CreatePipelineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;
}

export class TransitionPipelineDto {
  @IsEnum(PipelineStatus)
  status!: PipelineStatus;
}
