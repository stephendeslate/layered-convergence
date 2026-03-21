import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { WidgetType } from '@prisma/client';

export class CreateWidgetDto {
  @IsString()
  @IsNotEmpty()
  dashboardId!: string;

  @IsEnum(WidgetType)
  type!: WidgetType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsObject()
  position!: Record<string, unknown>;
}

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  position?: Record<string, unknown>;
}
