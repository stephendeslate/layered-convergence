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
import { MetricFieldDto } from './create-widget.dto';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  dataSourceId?: string;

  @IsString()
  @IsOptional()
  dimensionField?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MetricFieldDto)
  metricFields?: MetricFieldDto[];

  @IsString()
  @IsOptional()
  dateRangePreset?: string;

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
