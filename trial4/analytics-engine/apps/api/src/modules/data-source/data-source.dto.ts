import { IsString, IsOptional, IsObject, IsEnum, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum DataSourceType {
  POSTGRESQL = 'POSTGRESQL',
  API = 'API',
  CSV = 'CSV',
  WEBHOOK = 'WEBHOOK',
}

export class DataSourceConfigDto {
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

export class CreateDataSourceDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(DataSourceType)
  type: DataSourceType;

  @IsOptional()
  @ValidateNested()
  @Type(() => DataSourceConfigDto)
  config?: DataSourceConfigDto;
}

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEnum(DataSourceType)
  type?: DataSourceType;
}

export class ConfigureDataSourceDto {
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
