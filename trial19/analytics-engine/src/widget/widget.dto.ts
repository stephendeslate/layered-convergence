import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { WidgetType } from '@prisma/client';

export class CreateWidgetDto {
  @IsString()
  @IsNotEmpty()
  dashboardId!: string;

  @IsIn([WidgetType.CHART, WidgetType.TABLE, WidgetType.METRIC, WidgetType.MAP])
  type!: WidgetType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsOptional()
  position?: Record<string, unknown>;
}

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsOptional()
  position?: Record<string, unknown>;
}
