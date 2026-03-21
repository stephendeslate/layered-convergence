import { IsString, IsOptional, IsInt, IsObject, IsIn } from 'class-validator';

const WIDGET_TYPES = ['line', 'bar', 'pie', 'donut', 'area', 'kpi', 'table', 'funnel'] as const;

export class CreateWidgetDto {
  @IsString()
  dashboardId!: string;

  @IsIn(WIDGET_TYPES)
  type!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  positionX?: number;

  @IsOptional()
  @IsInt()
  positionY?: number;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;
}

export class UpdateWidgetDto {
  @IsOptional()
  @IsIn(WIDGET_TYPES)
  type?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  positionX?: number;

  @IsOptional()
  @IsInt()
  positionY?: number;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;
}
