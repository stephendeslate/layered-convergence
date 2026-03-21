import { IsObject, IsOptional, IsString, IsArray } from 'class-validator';

export class ConfigureDataSourceDto {
  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  transformSteps?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
