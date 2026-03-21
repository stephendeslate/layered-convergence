import { IsString, IsOptional, IsInt, IsObject } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  dashboardId!: string;

  @IsString()
  type!: string; // line, bar, pie, donut, area, kpi, table, funnel

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
