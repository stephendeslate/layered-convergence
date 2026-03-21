import { IsString, IsDateString, IsIn, IsOptional } from 'class-validator';

export class AggregateQueryDto {
  @IsString()
  dataSourceId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsIn(['hourly', 'daily', 'weekly'])
  bucket!: string;

  @IsOptional()
  @IsString()
  metricName?: string;
}
