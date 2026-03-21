import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  dashboardId!: string;
}
