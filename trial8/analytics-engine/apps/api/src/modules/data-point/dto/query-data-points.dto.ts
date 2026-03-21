import { IsString, IsOptional, IsDateString } from 'class-validator';

export class QueryDataPointsDto {
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
  groupBy?: string; // hour, day, week, month
}
