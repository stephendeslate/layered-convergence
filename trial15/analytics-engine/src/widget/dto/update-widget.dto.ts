import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}
