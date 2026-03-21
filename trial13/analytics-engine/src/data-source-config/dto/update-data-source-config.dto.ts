import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class UpdateDataSourceConfigDto {
  @IsObject()
  @IsOptional()
  connectionConfig?: Record<string, any>;

  @IsObject()
  @IsOptional()
  fieldMapping?: Record<string, any>;

  @IsArray()
  @IsOptional()
  transformSteps?: any[];

  @IsString()
  @IsOptional()
  syncSchedule?: string;
}
