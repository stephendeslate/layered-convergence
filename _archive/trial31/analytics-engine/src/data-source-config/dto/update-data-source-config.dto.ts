import { IsString, IsOptional } from 'class-validator';

export class UpdateDataSourceConfigDto {
  @IsOptional()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  fieldMapping?: Record<string, unknown>;

  @IsOptional()
  transformSteps?: unknown[];

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
