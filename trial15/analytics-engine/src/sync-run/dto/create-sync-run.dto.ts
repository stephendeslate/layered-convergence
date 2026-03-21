import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSyncRunDto {
  @IsString()
  @IsNotEmpty()
  pipelineId!: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  recordCount?: number;
}
