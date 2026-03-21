import { IsString, IsOptional, IsInt, IsIn, Min, Max } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  dashboardId!: string;

  @IsString()
  @IsIn(['line', 'bar', 'pie', 'donut', 'area', 'kpi', 'table', 'funnel'])
  type!: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  positionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  positionY?: number;

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
