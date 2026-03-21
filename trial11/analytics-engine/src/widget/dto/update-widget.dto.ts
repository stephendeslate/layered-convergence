import { IsEnum, IsInt, IsObject, IsOptional } from 'class-validator';
import { WidgetType } from '../../../generated/prisma/client.js';

export class UpdateWidgetDto {
  @IsEnum(WidgetType)
  @IsOptional()
  type?: WidgetType;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsInt()
  @IsOptional()
  positionX?: number;

  @IsInt()
  @IsOptional()
  positionY?: number;

  @IsInt()
  @IsOptional()
  width?: number;

  @IsInt()
  @IsOptional()
  height?: number;
}
