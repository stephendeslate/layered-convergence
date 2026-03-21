import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricFieldDto {
  @IsString()
  field!: string;

  @IsString()
  aggregation!: string;
}

export class QueryFilterDto {
  @IsString()
  field!: string;

  @IsString()
  operator!: string; // eq, neq, gt, lt, in

  value!: unknown;
}

export class ExecuteQueryDto {
  @IsString()
  dataSourceId!: string;

  @IsString()
  dimensionField!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetricFieldDto)
  metricFields!: MetricFieldDto[];

  @IsString()
  @IsOptional()
  dateRangePreset?: string;

  @IsString()
  @IsOptional()
  dateStart?: string;

  @IsString()
  @IsOptional()
  dateEnd?: string;

  @IsString()
  @IsOptional()
  groupingPeriod?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QueryFilterDto)
  filters?: QueryFilterDto[];

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}
