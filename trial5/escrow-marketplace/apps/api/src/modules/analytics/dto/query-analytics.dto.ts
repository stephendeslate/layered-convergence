import { IsOptional, IsDateString } from 'class-validator';

export class QueryAnalyticsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
