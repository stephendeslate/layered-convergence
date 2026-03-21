import { IsString, IsObject, IsDateString, IsOptional } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  dataSourceId!: string;

  @IsDateString()
  timestamp!: string;

  @IsObject()
  dimensions!: Record<string, unknown>;

  @IsObject()
  metrics!: Record<string, unknown>;
}

export class QueryDataPointsDto {
  @IsString()
  dataSourceId!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
