import { IsString, IsOptional, IsObject, IsDateString, IsInt, IsArray, Min, Max } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  dataSourceId: string;

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsObject()
  dimensions?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;
}

export class CreateBatchDataPointsDto {
  @IsString()
  dataSourceId: string;

  @IsArray()
  points: CreateDataPointDto[];
}

export class QueryDataPointsDto {
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
  @IsInt()
  @Min(1)
  @Max(10000)
  limit?: number;
}
