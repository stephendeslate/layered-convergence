import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class TriggerPipelineDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  @IsOptional()
  params?: Record<string, unknown>;
}
