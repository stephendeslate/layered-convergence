import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DataSourceType } from '../../../generated/prisma/client.js';

export class DataSourceConfigDto {
  @IsObject()
  @IsNotEmpty()
  connectionConfig: Record<string, unknown>;

  @IsObject()
  @IsNotEmpty()
  fieldMapping: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  transformSteps?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  syncSchedule?: string;
}

export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(DataSourceType)
  @IsNotEmpty()
  type: DataSourceType;

  @ValidateNested()
  @Type(() => DataSourceConfigDto)
  @IsOptional()
  config?: DataSourceConfigDto;
}
