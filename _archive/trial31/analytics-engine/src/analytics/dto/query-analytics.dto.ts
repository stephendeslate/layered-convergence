import { IsString, IsOptional, IsDateString } from 'class-validator';

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
  @IsString()
  granularity?: string;
}
