import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class UpdateDataSourceConfigDto {
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
