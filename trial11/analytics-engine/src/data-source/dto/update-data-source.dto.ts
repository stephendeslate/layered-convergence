import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { DataSourceType } from '../../../generated/prisma/client.js';

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DataSourceType)
  @IsOptional()
  type?: DataSourceType;

  @IsObject()
  @IsOptional()
  connectionConfig?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  fieldMapping?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  transformSteps?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  syncSchedule?: string;
}
