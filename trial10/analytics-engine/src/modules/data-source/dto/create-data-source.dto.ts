import { IsString, IsIn, IsOptional, MinLength } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @IsIn(['postgresql', 'api', 'csv', 'webhook'])
  type!: string;

  @IsOptional()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  fieldMapping?: Record<string, unknown>;

  @IsOptional()
  transformSteps?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
