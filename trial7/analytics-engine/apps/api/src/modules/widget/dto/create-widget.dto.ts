import { IsString, IsEnum, IsOptional, IsObject, IsInt, Min } from 'class-validator';
import { WidgetType } from '@prisma/client';

export class CreateWidgetDto {
  @IsString()
  dashboardId!: string;

  @IsEnum(WidgetType)
  type!: WidgetType;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sizeX?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sizeY?: number;
}
