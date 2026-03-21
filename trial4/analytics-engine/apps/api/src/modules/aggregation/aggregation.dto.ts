import { IsString, IsEnum, IsDateString } from 'class-validator';

export enum AggregationInterval {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export class AggregateQueryDto {
  @IsString()
  dataSourceId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(AggregationInterval)
  interval: string;
}
