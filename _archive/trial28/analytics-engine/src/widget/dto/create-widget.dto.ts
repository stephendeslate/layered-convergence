import { IsString, IsInt, IsObject, IsEnum } from 'class-validator';

export enum WidgetType {
  LINE_CHART = 'LINE_CHART',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  AREA_CHART = 'AREA_CHART',
  KPI_CARD = 'KPI_CARD',
  TABLE = 'TABLE',
  FUNNEL = 'FUNNEL',
}

export class CreateWidgetDto {
  @IsString()
  dashboardId: string;

  @IsEnum(WidgetType)
  type: WidgetType;

  @IsObject()
  config: Record<string, any>;

  @IsInt()
  positionX: number;

  @IsInt()
  positionY: number;

  @IsInt()
  width: number;

  @IsInt()
  height: number;
}
