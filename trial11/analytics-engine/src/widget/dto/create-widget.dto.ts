import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
} from 'class-validator';
import { WidgetType } from '../../../generated/prisma/client.js';

export class CreateWidgetDto {
  @IsEnum(WidgetType)
  @IsNotEmpty()
  type: WidgetType;

  @IsObject()
  @IsNotEmpty()
  config: Record<string, unknown>;

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
