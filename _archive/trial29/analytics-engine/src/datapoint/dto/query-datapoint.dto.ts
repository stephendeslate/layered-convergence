import { IsOptional, IsString, IsDateString } from 'class-validator';

export class QueryDataPointDto {
  @IsOptional()
  @IsString()
  dataSourceId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';

  @IsOptional()
  @IsString()
  groupBy?: string;
}
