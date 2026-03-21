import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum AggregationType {
  AVG = 'avg',
  SUM = 'sum',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
}

export class QueryDataPointsDto {
  @IsString()
  @IsOptional()
  metric?: string;

  @IsString()
  @IsOptional()
  dataSourceId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(AggregationType)
  @IsOptional()
  aggregation?: AggregationType;

  @IsString()
  @IsOptional()
  groupBy?: string;
}
