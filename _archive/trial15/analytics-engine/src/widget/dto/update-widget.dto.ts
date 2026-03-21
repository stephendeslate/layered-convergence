import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class UpdateWidgetDto {
  @IsString()
  @IsNotEmpty()
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
