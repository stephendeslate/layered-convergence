import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

export enum GroupByPeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class QueryDataPointDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(GroupByPeriod)
  @IsOptional()
  groupBy?: GroupByPeriod;
}
