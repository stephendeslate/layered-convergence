import { IsString, IsOptional, IsDateString } from 'class-validator';

export class QueryDataPointsDto {
  @IsString()
  dataSourceId: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
