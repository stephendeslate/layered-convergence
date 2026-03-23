import { IsString, MaxLength, IsOptional, IsObject, IsIn, IsNumber } from 'class-validator';

// TRACED:AE-API-010
export class CreatePipelineDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  schedule?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsNumber()
  processingCost!: number;

  @IsString()
  @MaxLength(36)
  dataSourceId!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}

export class UpdatePipelineDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['ACTIVE', 'PAUSED', 'FAILED', 'DISABLED'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  schedule?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  processingCost?: number;
}
