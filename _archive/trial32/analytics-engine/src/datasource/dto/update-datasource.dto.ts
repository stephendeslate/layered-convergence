import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { DataSourceType } from './create-datasource.dto.js';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(DataSourceType)
  type?: DataSourceType;
}

export class UpdateDataSourceConfigDto {
  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, any>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, any>;

  @IsOptional()
  @IsObject()
  transformSteps?: Record<string, any>;

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
