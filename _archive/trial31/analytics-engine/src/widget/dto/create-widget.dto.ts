import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  dashboardId!: string;

  @IsString()
  type!: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  positionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  positionY?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;
}
