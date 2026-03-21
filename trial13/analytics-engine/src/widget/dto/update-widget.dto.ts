import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsObject()
  @IsOptional()
  position?: Record<string, any>;

  @IsObject()
  @IsOptional()
  size?: Record<string, any>;
}
