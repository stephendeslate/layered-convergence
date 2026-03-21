import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum TimeBucket {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export class AggregationQueryDto {
  @IsString()
  dataSourceId: string;

  @IsEnum(TimeBucket)
  bucket: TimeBucket;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  metricKey?: string;
}
