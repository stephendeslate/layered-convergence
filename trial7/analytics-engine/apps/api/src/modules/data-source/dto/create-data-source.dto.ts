import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { DataSourceType } from '@prisma/client';

export class CreateDataSourceDto {
  @IsString()
  name!: string;

  @IsEnum(DataSourceType)
  type!: DataSourceType;

  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
