import { IsInt, IsObject, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @MinLength(1)
  type!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsString()
  size?: string;
}
