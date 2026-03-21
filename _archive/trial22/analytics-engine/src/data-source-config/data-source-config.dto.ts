import { IsObject, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateDataSourceConfigDto {
  @IsString()
  dataSourceId!: string;

  @IsObject()
  connectionConfig!: Record<string, unknown>;

  @IsObject()
  fieldMapping!: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  transformSteps?: unknown[];

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}

export class UpdateDataSourceConfigDto {
  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  transformSteps?: unknown[];

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
