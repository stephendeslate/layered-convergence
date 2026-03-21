import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  config?: any;

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
