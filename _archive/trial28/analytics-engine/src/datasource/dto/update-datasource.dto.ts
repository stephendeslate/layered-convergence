import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;
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
