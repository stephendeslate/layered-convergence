import { IsString, IsOptional, IsIn, IsObject, IsArray } from 'class-validator';

const SOURCE_TYPES = ['postgresql', 'api', 'csv', 'webhook'] as const;

export class CreateDataSourceDto {
  @IsString()
  name!: string;

  @IsIn(SOURCE_TYPES)
  type!: string;

  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  fieldMapping?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  transformSteps?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  fieldMapping?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  transformSteps?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
