import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class FieldMappingDto {
  @IsString()
  sourceField!: string;

  @IsString()
  targetField!: string;

  @IsString()
  fieldType!: string; // STRING, NUMBER, DATE, BOOLEAN

  @IsString()
  fieldRole!: string; // DIMENSION, METRIC

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class CreateDataSourceDto {
  @IsString()
  name!: string;

  @IsString()
  connectorType!: string; // REST_API, POSTGRESQL, CSV, WEBHOOK

  @IsString()
  @IsOptional()
  syncSchedule?: string; // MANUAL, EVERY_15_MIN, HOURLY, DAILY, WEEKLY

  @IsOptional()
  config?: Record<string, unknown>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldMappingDto)
  @IsOptional()
  fieldMappings?: FieldMappingDto[];

  @IsArray()
  @IsOptional()
  transforms?: Record<string, unknown>[];
}
