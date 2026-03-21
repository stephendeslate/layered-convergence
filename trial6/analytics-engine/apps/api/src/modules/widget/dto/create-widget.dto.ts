import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsObject,
} from 'class-validator';
import { WidgetType } from '@prisma/client';

export class CreateWidgetDto {
  @IsString()
  @IsNotEmpty()
  dashboardId: string;

  @IsEnum(WidgetType)
  type: WidgetType;

  @IsObject()
  config: Record<string, unknown>;

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
