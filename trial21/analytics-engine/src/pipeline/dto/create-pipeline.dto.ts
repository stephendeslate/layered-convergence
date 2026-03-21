import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreatePipelineDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
