import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class QueryAnalyticsDto {
  @IsString()
  dataSourceId!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['hour', 'day', 'week', 'month'])
  granularity?: string;

  @IsOptional()
  @IsString()
  dimension?: string;
}
