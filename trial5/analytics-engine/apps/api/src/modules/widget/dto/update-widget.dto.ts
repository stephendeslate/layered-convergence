import { IsEnum, IsOptional, IsObject, IsInt, Min } from 'class-validator';
import { WidgetType } from '@prisma/client';

export class UpdateWidgetDto {
  @IsOptional()
  @IsEnum(WidgetType)
  type?: WidgetType;

  @IsOptional()
  @IsObject()
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
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;
}
