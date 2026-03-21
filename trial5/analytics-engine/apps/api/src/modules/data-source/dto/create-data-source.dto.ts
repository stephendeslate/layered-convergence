import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DataSourceType } from '@prisma/client';

export class DataSourceConfigDto {
  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, unknown>;

  @IsOptional()
  transformSteps?: unknown[];

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}

export class CreateDataSourceDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  name: string;

  @IsEnum(DataSourceType)
  type: DataSourceType;

  @IsOptional()
  @ValidateNested()
  @Type(() => DataSourceConfigDto)
  config?: DataSourceConfigDto;
}
