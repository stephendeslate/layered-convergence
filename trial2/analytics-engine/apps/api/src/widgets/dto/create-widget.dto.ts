import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';
import { WidgetType } from '@analytics-engine/shared';

export class CreateWidgetDto {
  @IsEnum(WidgetType)
  type!: WidgetType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsObject()
  position!: { col: number; row: number };

  @IsObject()
  size!: { colSpan: number; rowSpan: number };

  @IsString()
  @IsOptional()
  dataSourceId?: string;
}
