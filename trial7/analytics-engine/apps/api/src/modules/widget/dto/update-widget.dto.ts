import { IsOptional, IsObject, IsInt, Min } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sizeX?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sizeY?: number;
}
