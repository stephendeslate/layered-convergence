import { IsEnum, IsOptional, IsInt, IsObject } from 'class-validator';
import { WidgetType } from '@prisma/client';

export class UpdateWidgetDto {
  @IsEnum(WidgetType)
  @IsOptional()
  type?: WidgetType;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsInt()
  @IsOptional()
  width?: number;

  @IsInt()
  @IsOptional()
  height?: number;
}
