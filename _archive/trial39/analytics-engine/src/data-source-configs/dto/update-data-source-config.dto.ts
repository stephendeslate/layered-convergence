import { IsOptional, IsString } from 'class-validator';

export class UpdateDataSourceConfigDto {
  @IsOptional()
  connectionConfig?: any;

  @IsOptional()
  fieldMapping?: any;

  @IsOptional()
  transformSteps?: any;

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
