import {
  IsString,
  IsOptional,
  IsObject,
  IsInt,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  dashboardId!: string;

  @IsString()
  @IsIn(['line', 'bar', 'pie', 'donut', 'area', 'kpi', 'table', 'funnel'])
  type!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  height?: number;
}

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @IsIn(['line', 'bar', 'pie', 'donut', 'area', 'kpi', 'table', 'funnel'])
  type?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  height?: number;
}
