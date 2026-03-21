import { IsOptional, IsInt, IsObject, IsEnum } from 'class-validator';
import { WidgetType } from './create-widget.dto.js';

export class UpdateWidgetDto {
  @IsOptional()
  @IsEnum(WidgetType)
  type?: WidgetType;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

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
