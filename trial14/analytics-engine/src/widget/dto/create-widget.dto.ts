import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @IsNotEmpty()
  dashboardId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

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
