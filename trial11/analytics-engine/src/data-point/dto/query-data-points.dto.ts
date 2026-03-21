import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryDataPointsDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsObject()
  @IsOptional()
  dimensions?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  groupBy?: string;
}
