import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum DataSourceType {
  POSTGRESQL = 'POSTGRESQL',
  API = 'API',
  CSV = 'CSV',
  WEBHOOK = 'WEBHOOK',
}

export class CreateDataSourceDto {
  @IsString()
  name: string;

  @IsEnum(DataSourceType)
  type: DataSourceType;
}

export class CreateDataSourceConfigDto {
  @IsObject()
  connectionConfig: Record<string, any>;

  @IsObject()
  fieldMapping: Record<string, any>;

  @IsObject()
  transformSteps: Record<string, any>;

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
