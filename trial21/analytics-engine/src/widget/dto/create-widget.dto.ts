import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { WidgetType } from '@prisma/client';

export class CreateWidgetDto {
  @IsString()
  title!: string;

  @IsEnum(WidgetType)
  type!: WidgetType;

  @IsString()
  dashboardId!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
