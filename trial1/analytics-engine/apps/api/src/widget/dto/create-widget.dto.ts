import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MetricFieldDto {
  @IsString()
  field!: string;

  @IsString()
  aggregation!: string;
}

export class CreateWidgetDto {
  @IsString()
  type!: string; // LINE, BAR, PIE_DONUT, AREA, KPI_CARD, TABLE, FUNNEL

  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

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
  dateRangeStart?: string;

  @IsString()
  @IsOptional()
  dateRangeEnd?: string;

  @IsString()
  @IsOptional()
  groupingPeriod?: string;

  @IsInt()
  @Min(1)
  @Max(24)
  @IsOptional()
  gridColumnStart?: number;

  @IsInt()
  @Min(1)
  @Max(24)
  @IsOptional()
  gridColumnSpan?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  gridRowStart?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  gridRowSpan?: number;

  @IsOptional()
  typeConfig?: Record<string, unknown>;
}
