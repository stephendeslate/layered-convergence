import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  position?: { col: number; row: number };

  @IsObject()
  @IsOptional()
  size?: { colSpan: number; rowSpan: number };

  @IsString()
  @IsOptional()
  dataSourceId?: string;
}
