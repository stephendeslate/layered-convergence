import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsArray, Matches } from 'class-validator';
import { ConnectorType } from '@analytics-engine/shared';

export class DataSourceConfigDto {
  @IsObject()
  connectionConfig!: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  fieldMapping?: Record<string, unknown>[];

  @IsArray()
  @IsOptional()
  transformSteps?: Record<string, unknown>[];

  @IsString()
  @IsOptional()
  @Matches(/^(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)$/, {
    message: 'syncSchedule must be a valid cron expression',
  })
  syncSchedule?: string;
}

export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(ConnectorType)
  type!: ConnectorType;

  @IsObject()
  config!: DataSourceConfigDto;
}
